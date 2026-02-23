import fs from "fs";
import path from "path";
import readline from "readline";
import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { buildScanTargets } from "../utils/fileScanner.js";
import { runRuleEngine } from "../engine/ruleEngine.js";
import { logInfo, logWarn, logSuccess, logError } from "../utils/logger.js";
import { ensureEnvFile, readEnvKeys, appendEnvEntries, generateVarName, groupSecretsByValue, envVariableExists } from "../utils/envManager.js";
import { detectEnvStrategy, getEnvReference } from "../utils/frameworkDetector.js";
import { createBackupDir, backupFiles, getBackupDisplayPath } from "../utils/backupManager.js";
import { replaceSecretInFile } from "../utils/astReplacer.js";
import { ensureEnvInGitignore } from "../utils/gitignoreManager.js";


/**
 * Parses command-line arguments
 */
function parseArgs(args) {
  return {
    dryRun: args.includes("--dry-run"),
    force: args.includes("--force"),
    verbose: args.includes("--verbose") || args.includes("-v")
  };
}

/**
 * Ask user for confirmation
 */
function confirmProceed(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(String(answer).trim().toLowerCase() === "y");
    });
  });
}

/**
 * Filter secrets that should be moved to environment variables
 */
function filterHighConfidenceSecrets(findings) {
  return findings.filter(finding => {
    // Only process secret-related findings
    if (!finding.ruleId?.startsWith("secret.")) {
      return false;
    }

    // Include all secrets with "block" severity (these are security-critical)
    // This ensures we catch all types of secrets, not just high-confidence ones
    if (finding.severity !== "block") {
      return false;
    }

    // Exclude files that shouldn't be modified
    const filePath = finding.filePath.toLowerCase();
    const excludePatterns = [
      /\.codeproof-backup[\\/]/,  // Backup directories
      /node_modules[\\/]/,          // Dependencies
      /\.git[\\/]/,                 // Git internals
      /\.(md|txt|rst)$/,            // Documentation
      /\.(ipynb)$/,                 // Jupyter notebooks
      /readme/i,                    // README files
      /changelog/i,                 // Changelog files
      /\.example\./,                // Example files
      /\.sample\./,                 // Sample files
      /\.test\./,                   // Test files
      /\.spec\./,                   // Spec files
      /[\\/]test[\\/]/,             // Test directories
      /[\\/]tests[\\/]/,            // Tests directories
      /[\\/]__tests__[\\/]/,        // Jest tests
      /[\\/]spec[\\/]/,             // Spec directories
      /[\\/]mock[\\/]/,             // Mock directories
      /[\\/]mocks[\\/]/,            // Mocks directories
      /[\\/]fixtures[\\/]/,         // Fixture directories
    ];

    if (excludePatterns.some(pattern => pattern.test(filePath))) {
      return false;
    }

    return true;
  });
}

/**
 * Main command implementation
 */
export async function runMoveSecret({ args = [], cwd }) {
  const options = parseArgs(args);
  
  logInfo("🔍 CodeProof Secret Mover");
  logInfo("━".repeat(50));

  // Step 1: Validate git repository
  try {
    ensureGitRepo(cwd);
  } catch (error) {
    logError("Not a git repository. Please initialize git first.");
    process.exit(1);
  }

  const gitRoot = getGitRoot(cwd);
  
  // Step 2: Scan project for secrets
  logInfo("Scanning project for secrets...");
  
  const scanTargets = buildScanTargets({
    gitRoot,
    scanMode: "full",
    stagedFiles: []
  });

  if (scanTargets.length === 0) {
    logInfo("No files to scan.");
    process.exit(0);
  }

  const { findings } = runRuleEngine({ files: scanTargets });
  const secrets = filterHighConfidenceSecrets(findings);

  if (secrets.length === 0) {
    logSuccess("✓ No high-confidence secrets found!");
    process.exit(0);
  }

  logInfo(`Found ${secrets.length} high-confidence secret(s)`);

  // Step 3: Group secrets by value to avoid duplicates
  const secretGroups = groupSecretsByValue(secrets);
  logInfo(`Grouped into ${secretGroups.size} unique secret(s)`);

  // Step 4: Detect framework strategy
  const { strategy, prefix } = detectEnvStrategy(gitRoot);
  if (options.verbose) {
    logInfo(`Framework strategy: ${strategy}${prefix ? ` (prefix: ${prefix})` : ""}`);
  }

  // Step 5: Generate variable names
  const envPath = ensureEnvFile(gitRoot);
  const existingKeys = readEnvKeys(envPath);
  const usedNames = new Set(existingKeys);
  
  const secretsToProcess = [];
  const envEntries = [];

  for (const [secretValue, occurrences] of secretGroups) {
    const firstOccurrence = occurrences[0];
    const varName = generateVarName(
      firstOccurrence.ruleId,
      firstOccurrence.snippet,
      usedNames
    );

    // Check if variable already exists
    if (existingKeys.has(varName)) {
      logWarn(`Variable ${varName} already exists in .env, will not overwrite`);
      continue;
    }

    secretsToProcess.push({
      varName,
      secretValue,
      occurrences
    });

    envEntries.push({ key: varName, value: secretValue });
  }

  if (secretsToProcess.length === 0) {
    logInfo("All secrets are already in .env");
    process.exit(0);
  }

  // Step 6: Display preview
  logInfo("\n📋 Preview:");
  logInfo("━".repeat(50));
  logInfo("\nEnvironment variables to create:");
  for (const { varName, occurrences } of secretsToProcess) {
    logInfo(`  ${varName} (used in ${occurrences.length} location(s))`);
  }

  logInfo("\nFiles to modify:");
  const filesToModify = new Set();
  for (const { occurrences } of secretsToProcess) {
    for (const occurrence of occurrences) {
      filesToModify.add(occurrence.filePath);
    }
  }
  for (const filePath of filesToModify) {
    const relative = path.relative(gitRoot, filePath);
    logInfo(`  ${relative}`);
  }

  // Step 7: Dry run exit
  if (options.dryRun) {
    logInfo("\n--dry-run mode: No files modified");
    process.exit(0);
  }

  // Step 8: Confirmation
  if (!options.force) {
    logInfo("");
    const confirmed = await confirmProceed("Proceed with changes? (y/N): ");
    if (!confirmed) {
      logInfo("Aborted. No changes made.");
      process.exit(0);
    }
  }

  // Step 9: Create backup
  logInfo("\n📦 Creating backup...");
  const backupDir = await createBackupDir(gitRoot);
  const backedUpCount = await backupFiles(Array.from(filesToModify), gitRoot, backupDir);
  logInfo(`✓ Backed up ${backedUpCount} file(s)`);

  // Step 10: Replace secrets in files
  logInfo("\n🔄 Replacing secrets...");
  let totalChanges = 0;
  const warnings = [];

  for (const { varName, secretValue, occurrences } of secretsToProcess) {
    for (const occurrence of occurrences) {
      const envRef = getEnvReference(varName, strategy, prefix, occurrence.filePath);
      const result = await replaceSecretInFile(
        occurrence.filePath,
        secretValue,
        envRef,
        varName
      );

      if (result.success) {
        if (result.changes > 0) {
          totalChanges += result.changes;
          const relative = path.relative(gitRoot, occurrence.filePath);
          logInfo(`  ✓ ${relative}: ${result.changes} replacement(s)`);
        }
        if (result.warning) {
          warnings.push(`${path.relative(gitRoot, occurrence.filePath)}: ${result.warning}`);
        }
      } else {
        logWarn(`  ✗ ${path.relative(gitRoot, occurrence.filePath)}: ${result.error}`);
      }
    }
  }

  // Step 11: Update .env file
  logInfo("\n📝 Updating .env...");
  try {
    appendEnvEntries(envPath, envEntries);
    logInfo(`✓ Added ${envEntries.length} variable(s) to .env`);
  } catch (error) {
    logError(`Failed to update .env: ${error.message}`);
    process.exit(1);
  }

  // Step 12: Update .gitignore
  logInfo("\n🔒 Updating .gitignore...");
  try {
    const { created, added } = await ensureEnvInGitignore(gitRoot);
    if (created) {
      logInfo("✓ Created .gitignore");
    }
    if (added.length > 0) {
      logInfo(`✓ Added ${added.join(", ")} to .gitignore`);
    } else {
      logInfo("✓ .env already in .gitignore");
    }
  } catch (error) {
    logWarn(`Failed to update .gitignore: ${error.message}`);
  }

  // Step 13: Summary
  logInfo("\n" + "━".repeat(50));
  logSuccess("✓ Secret move completed successfully!");
  logInfo("━".repeat(50));
  logInfo(`Secrets moved: ${secretsToProcess.length}`);
  logInfo(`Files modified: ${filesToModify.size}`);
  logInfo(`Total replacements: ${totalChanges}`);
  logInfo(`Backup: ${getBackupDisplayPath(backupDir, gitRoot)}`);

  if (warnings.length > 0) {
    logInfo("\n⚠ Warnings:");
    for (const warning of warnings) {
      logWarn(`  ${warning}`);
    }
  }

  logInfo("\n💡 Next steps:");
  logInfo("  1. Review the changes in your files");
  logInfo("  2. Test your application");
  logInfo("  3. Commit the changes (excluding .env)");
  logInfo("  4. Share .env.example with your team");
}
