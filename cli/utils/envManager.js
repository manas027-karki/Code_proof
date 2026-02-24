import fs from "fs";
import os from "os";
import path from "path";

export function ensureEnvFile(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, "", "utf8");
  }
  return envPath;
}

export function readEnvKeys(envPath) {
  if (!fs.existsSync(envPath)) {
    return new Set();
  }

  const content = fs.readFileSync(envPath, "utf8");
  const keys = new Set();
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    if (key) {
      keys.add(key);
    }
  }

  return keys;
}

export function appendEnvEntries(envPath, entries) {
  if (!entries.length) {
    return;
  }
  // Safety: append only to avoid overwriting existing .env entries.
  const lines = entries.map((entry) => `${entry.key}=${entry.value}`);
  const content = lines.join(os.EOL) + os.EOL;
  fs.appendFileSync(envPath, content, "utf8");
}

/**
 * Checks if a variable name already exists in the .env file
 * 
 * @param {string} projectRoot - Root directory of the project
 * @param {string} varName - Variable name to check
 * @returns {boolean}
 */
export function envVariableExists(projectRoot, varName) {
  const envPath = path.join(projectRoot, ".env");
  const keys = readEnvKeys(envPath);
  return keys.has(varName);
}

/**
 * Generates a deterministic environment variable name based on secret type and context
 * 
 * @param {string} secretType - The type of secret (from rule ID)
 * @param {string} snippet - Code snippet containing the secret
 * @param {Set<string>} usedNames - Set of already used variable names
 * @returns {string}
 */
export function generateVarName(secretType, snippet, usedNames) {
  let baseName = "";
  
  // Extract variable name from snippet if possible
  const varNameMatch = snippet.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/);
  if (varNameMatch) {
    const extractedName = varNameMatch[1].toUpperCase();
    
    // Map common patterns to standard names
    if (extractedName.includes("OPENAI") || extractedName.includes("OPEN_AI")) {
      baseName = "OPENAI_API_KEY";
    } else if (extractedName.includes("AWS_ACCESS") || extractedName.includes("ACCESS_KEY")) {
      baseName = "AWS_ACCESS_KEY";
    } else if (extractedName.includes("AWS_SECRET") || extractedName.includes("SECRET_ACCESS")) {
      baseName = "AWS_SECRET_ACCESS_KEY";
    } else if (extractedName.includes("JWT")) {
      baseName = "JWT_SECRET";
    } else if (extractedName.includes("API_KEY") || extractedName.includes("APIKEY")) {
      baseName = "API_KEY";
    } else if (extractedName.includes("TOKEN")) {
      baseName = "AUTH_TOKEN";
    } else if (extractedName.includes("PASSWORD")) {
      baseName = "PASSWORD";
    } else if (extractedName.includes("SECRET")) {
      baseName = "SECRET";
    } else {
      baseName = extractedName;
    }
  } else {
    // Fallback based on secret type
    if (secretType.includes("aws_access")) {
      baseName = "AWS_ACCESS_KEY";
    } else if (secretType.includes("api_key")) {
      baseName = "API_KEY";
    } else if (secretType.includes("token")) {
      baseName = "AUTH_TOKEN";
    } else {
      baseName = "SECRET";
    }
  }
  
  // Ensure uniqueness
  let finalName = baseName;
  let counter = 1;
  while (usedNames.has(finalName)) {
    finalName = `${baseName}_${counter}`;
    counter++;
  }
  
  usedNames.add(finalName);
  return finalName;
}

/**
 * Groups secrets by their value to avoid duplicates
 * 
 * @param {Array} secrets - Array of secret findings
 * @returns {Map<string, Array>} - Map of secret values to their occurrences
 */
export function groupSecretsByValue(secrets) {
  const grouped = new Map();
  
  for (const secret of secrets) {
    // Extract the actual secret value from the snippet
    const valueMatch = secret.snippet.match(/['"`]([^'"`]+)['"`]/);
    if (valueMatch) {
      const value = valueMatch[1];
      if (!grouped.has(value)) {
        grouped.set(value, []);
      }
      grouped.get(value).push(secret);
    }
  }
  
  return grouped;
}
