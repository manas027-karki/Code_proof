import fs from "fs";
import path from "path";
import { listFilesRecursive, getDefaultExcludes, isBinaryFile } from "../utils/files.js";

const MAX_FILE_BYTES_FOR_GEMINI = 120_000;

const SUSPICIOUS_PATTERNS = [
  {
    id: "send_secrets",
    regex: /send.*(api|token|secret|env)/i,
    reason: "Possible instruction to send or expose API keys, tokens, secrets, or environment variables.",
    weight: "high"
  },
  {
    id: "upload_credentials",
    regex: /upload.*(credential|password|secret|token)/i,
    reason: "Possible instruction to upload credentials or secrets.",
    weight: "high"
  },
  {
    id: "ignore_security",
    regex: /(ignore|bypass|disable).*(security|auth|validation|check)/i,
    reason: "Possible instruction to ignore security checks or disable validation.",
    weight: "high"
  },
  {
    id: "curl_http",
    regex: /curl\s+https?:\/\//i,
    reason: "Use of curl to contact remote HTTP(S) endpoints.",
    weight: "medium"
  },
  {
    id: "wget_http",
    regex: /wget\s+https?:\/\//i,
    reason: "Use of wget to contact remote HTTP(S) endpoints.",
    weight: "medium"
  },
  {
    id: "execute_script",
    regex: /(bash|sh|powershell|python|node)\s+-c\s+|execute.*script|eval\(/i,
    reason: "Possible instruction to execute arbitrary scripts or commands.",
    weight: "high"
  },
  {
    id: "external_url",
    regex: /https?:\/\/[^\s)]+/i,
    reason: "References to external URLs that may be used for data exfiltration or remote control.",
    weight: "low"
  },
  {
    id: "base64_blob",
    regex: /[A-Za-z0-9+/]{40,}={0,2}/,
    reason: "Large base64-looking blob that may contain embedded secrets or payloads.",
    weight: "medium"
  },
  {
    id: "remote_communication",
    regex: /(send|post|upload).*(server|endpoint|webhook|remote)/i,
    reason: "Possible instruction to send data to a remote server or endpoint.",
    weight: "medium"
  }
];

function isInterestingAiFile(filePath, gitRoot) {
  const relative = path.relative(gitRoot, filePath);
  const lower = relative.toLowerCase();
  const base = path.basename(lower);

  if (base.endsWith(".md")) {
    return true;
  }

  if (
    lower.includes(`${path.sep}.cursor${path.sep}`) ||
    lower.startsWith(`.cursor${path.sep}`) ||
    lower.includes(`${path.sep}.ai${path.sep}`) ||
    lower.startsWith(`.ai${path.sep}`) ||
    lower.includes(`${path.sep}.github${path.sep}`) ||
    lower.startsWith(`.github${path.sep}`)
  ) {
    return true;
  }

  const upperRelative = relative.toUpperCase();
  if (
    upperRelative.includes("AGENTS") ||
    upperRelative.includes("RULES") ||
    upperRelative.includes("PROMPT") ||
    upperRelative.includes("README")
  ) {
    return true;
  }

  return false;
}

function runHeuristicScan(content) {
  const matchedReasons = [];
  let highWeightCount = 0;
  let mediumWeightCount = 0;

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.regex.test(content)) {
      matchedReasons.push(pattern.reason);
      if (pattern.weight === "high") {
        highWeightCount += 1;
      } else if (pattern.weight === "medium") {
        mediumWeightCount += 1;
      }
    }
  }

  const totalMatches = matchedReasons.length;

  if (totalMatches === 0) {
    return {
      riskLevel: "LOW",
      reasons: [],
      matchCount: 0
    };
  }

  let riskLevel = "MEDIUM";

  if (highWeightCount > 0 || totalMatches >= 3) {
    riskLevel = "HIGH";
  } else if (mediumWeightCount === 0 && totalMatches === 1) {
    riskLevel = "MEDIUM";
  }

  return {
    riskLevel,
    reasons: matchedReasons,
    matchCount: totalMatches
  };
}

function tryExtractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

async function runGeminiAnalysis({ filePath, content }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof fetch === "undefined") {
    return null;
  }

  const truncatedContent =
    content.length > MAX_FILE_BYTES_FOR_GEMINI ? content.slice(0, MAX_FILE_BYTES_FOR_GEMINI) : content;

  const prompt = [
    "You are a security analyzer for AI prompt and markdown configuration files.",
    "Analyze the following file content for prompt injection, secret exfiltration, or supply-chain risks.",
    "Return ONLY a single JSON object with the following shape:",
    '{',
    '  "risk_level": "LOW" | "MEDIUM" | "HIGH",',
    '  "reasons": string[],',
    '  "recommended_action": string',
    "}",
    "",
    `File path: ${filePath}`,
    "",
    "Content:",
    truncatedContent
  ].join("\n");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    const jsonString = tryExtractJson(rawText);
    if (!jsonString) {
      return null;
    }

    const parsed = JSON.parse(jsonString);
    const level = String(parsed.risk_level || parsed.riskLevel || "LOW").toUpperCase();
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [];
    const recommendedAction = parsed.recommended_action || parsed.recommendedAction || "";

    if (!["LOW", "MEDIUM", "HIGH"].includes(level)) {
      return null;
    }

    return {
      riskLevel: level,
      reasons,
      recommendedAction: String(recommendedAction || "").trim()
    };
  } catch {
    return null;
  }
}

export async function scanAiPrompts({ gitRoot, config }) {
  const excludes = getDefaultExcludes();
  const allFiles = listFilesRecursive(gitRoot, excludes);

  const candidateFiles = allFiles.filter((filePath) => isInterestingAiFile(filePath, gitRoot));
  const filesScanned = candidateFiles.length;

  const results = [];

  const useGemini =
    Boolean(process.env.GEMINI_API_KEY) &&
    (config?.aiPromptScanner?.useGemini !== false && config?.aiPromptScanner?.enabled !== false);

  for (const filePath of candidateFiles) {
    if (isBinaryFile(filePath)) {
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const heuristic = runHeuristicScan(content);

    // No suspicious patterns at all – skip to keep noise low but still count as scanned
    if (heuristic.matchCount === 0) {
      continue;
    }

    let finalRiskLevel = heuristic.riskLevel;
    let reasons = [...heuristic.reasons];
    let recommendation =
      "Review this AI configuration or markdown file for potential prompt injection or secret exfiltration risks.";
    let usedGemini = false;

    if (useGemini) {
      const gemini = await runGeminiAnalysis({ filePath, content });
      if (gemini) {
        usedGemini = true;
        finalRiskLevel = gemini.riskLevel || finalRiskLevel;
        if (Array.isArray(gemini.reasons) && gemini.reasons.length > 0) {
          reasons = gemini.reasons;
        }
        if (gemini.recommendedAction) {
          recommendation = gemini.recommendedAction;
        }
      }
    }

    results.push({
      filePath,
      riskLevel: finalRiskLevel,
      reasons,
      recommendation,
      heuristicMatches: heuristic.reasons,
      usedGemini
    });
  }

  const risksFound = results.length;
  const scoreImpact = results.reduce((acc, entry) => {
    if (entry.riskLevel === "HIGH") return acc - 25;
    if (entry.riskLevel === "MEDIUM") return acc - 10;
    return acc;
  }, 0);

  return {
    filesScanned,
    risksFound,
    scoreImpact,
    results
  };
}

