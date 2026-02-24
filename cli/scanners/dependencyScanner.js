import fs from "fs";
import path from "path";
import { logWarn } from "../utils/logger.js";

const DEFAULT_REGISTRY_BASE = "https://registry.npmjs.org";
const DEFAULT_CONCURRENCY = 8;

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseSemver(value) {
  if (!value) return null;
  const match = String(value).match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10)
  };
}

function getInstalledVersion({ gitRoot, packageName, manifestRange }) {
  const packageLockPath = path.join(gitRoot, "package-lock.json");
  const lock = safeReadJson(packageLockPath);
  if (lock) {
    // npm lockfile v2+ has `packages["node_modules/<name>"].version`
    const packages = lock.packages;
    if (packages && typeof packages === "object") {
      const key = `node_modules/${packageName}`;
      const entry = packages[key];
      if (entry && typeof entry.version === "string") {
        return entry.version;
      }
    }
    // older lockfile: `dependencies[name].version`
    const deps = lock.dependencies;
    if (deps && deps[packageName] && typeof deps[packageName].version === "string") {
      return deps[packageName].version;
    }
  }

  // Fallback: best-effort parse from manifest range (e.g. ^1.2.3 -> 1.2.3)
  const parsed = parseSemver(manifestRange);
  return parsed ? `${parsed.major}.${parsed.minor}.${parsed.patch}` : String(manifestRange || "");
}

async function fetchRegistryMeta({ registryBase, packageName }) {
  const url = `${registryBase}/${encodeURIComponent(packageName)}`;
  const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
  if (!res.ok) {
    throw new Error(`npm registry request failed (${res.status})`);
  }
  return res.json();
}

function classifyDependency({ installedVersion, latestVersion, deprecatedMessage }) {
  if (deprecatedMessage) {
    return { riskLevel: "HIGH", status: "Deprecated" };
  }

  const installed = parseSemver(installedVersion);
  const latest = parseSemver(latestVersion);
  if (!installed || !latest) {
    // If we can't compare versions, keep it low risk unless deprecated.
    return { riskLevel: "LOW", status: "Unknown" };
  }

  if (installed.major < latest.major) {
    return { riskLevel: "MEDIUM", status: "Outdated" };
  }

  return { riskLevel: "LOW", status: "Up to date" };
}

function scoreImpactForRisk(riskLevel) {
  if (riskLevel === "HIGH") return -30;
  if (riskLevel === "MEDIUM") return -10;
  return 0;
}

function createLimiter(concurrency) {
  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= concurrency) return;
    const job = queue.shift();
    if (!job) return;
    active += 1;
    Promise.resolve()
      .then(job.fn)
      .then(job.resolve, job.reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };

  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

export async function scanDependencies({ gitRoot, config }) {
  const enabled = config?.dependencyScanner?.enabled !== false;
  if (!enabled) {
    return {
      skipped: true,
      reason: "dependencyScanner disabled in config",
      dependenciesScanned: 0,
      deprecatedCount: 0,
      outdatedCount: 0,
      scoreImpact: 0,
      results: []
    };
  }

  const packageJsonPath = path.join(gitRoot, "package.json");
  const pkg = safeReadJson(packageJsonPath);
  if (!pkg) {
    return {
      skipped: true,
      reason: "package.json not found",
      dependenciesScanned: 0,
      deprecatedCount: 0,
      outdatedCount: 0,
      scoreImpact: 0,
      results: []
    };
  }

  const includeDev = config?.dependencyScanner?.includeDevDependencies !== false;
  const deps = { ...(pkg.dependencies || {}), ...(includeDev ? pkg.devDependencies || {} : {}) };
  const names = Object.keys(deps).sort();

  const registryBase = String(config?.dependencyScanner?.registryBase || DEFAULT_REGISTRY_BASE);
  const concurrency = Number.isFinite(config?.dependencyScanner?.concurrency)
    ? Math.max(1, Number(config.dependencyScanner.concurrency))
    : DEFAULT_CONCURRENCY;
  const limit = createLimiter(concurrency);

  const results = [];

  await Promise.all(
    names.map((name) =>
      limit(async () => {
        const manifestRange = deps[name];
        const installedVersion = getInstalledVersion({ gitRoot, packageName: name, manifestRange });

        let meta;
        try {
          meta = await fetchRegistryMeta({ registryBase, packageName: name });
        } catch (err) {
          logWarn(`Dependency scan: failed to query npm for ${name}. Skipping.`);
          return;
        }

        const latestVersion = meta?.["dist-tags"]?.latest || "";
        const deprecatedMessage =
          meta?.deprecated ||
          (latestVersion && meta?.versions?.[latestVersion]?.deprecated) ||
          "";

        const classification = classifyDependency({
          installedVersion,
          latestVersion,
          deprecatedMessage
        });

        if (classification.riskLevel === "LOW") {
          return;
        }

        const recommendation = latestVersion
          ? `npm install ${name}@${latestVersion}`
          : `npm install ${name}@latest`;

        results.push({
          package: name,
          current: installedVersion,
          latest: latestVersion || "unknown",
          riskLevel: classification.riskLevel,
          status: classification.status,
          deprecatedMessage: String(deprecatedMessage || ""),
          recommendation
        });
      })
    )
  );

  const dependenciesScanned = names.length;
  const deprecatedCount = results.filter((r) => r.riskLevel === "HIGH").length;
  const outdatedCount = results.filter((r) => r.riskLevel === "MEDIUM").length;
  const scoreImpact = results.reduce((acc, r) => acc + scoreImpactForRisk(r.riskLevel), 0);

  // Stable output: show highest risk first, then alphabetical
  results.sort((a, b) => {
    const score = (lvl) => (lvl === "HIGH" ? 2 : lvl === "MEDIUM" ? 1 : 0);
    const diff = score(b.riskLevel) - score(a.riskLevel);
    if (diff !== 0) return diff;
    return a.package.localeCompare(b.package);
  });

  return {
    skipped: false,
    dependenciesScanned,
    deprecatedCount,
    outdatedCount,
    scoreImpact,
    results
  };
}

