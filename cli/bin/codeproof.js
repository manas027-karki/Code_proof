#!/usr/bin/env node
import { runInit } from "../commands/init.js";
import { runCli } from "../commands/run.js";
import { runReportDashboard } from "../commands/reportDashboard.js";
import { runMoveSecret } from "../commands/moveSecret.js";
import { runWhoAmI } from "../commands/whoami.js";
import { runIgnore } from "../commands/ignore.js";
import { runApply } from "../commands/apply.js";
import { runHelp } from "../commands/help.js";
import { logError, logInfo } from "../utils/logger.js";

const [, , command, ...args] = process.argv;

// Available commands for validation and suggestions
const VALID_COMMANDS = [
  "init",
  "run",
  "report@dashboard",
  "move-secret",
  "ignore",
  "apply",
  "whoami",
  "help"
];

/**
 * Calculate Levenshtein distance between two strings
 * Used for "did you mean" suggestions
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Find the closest matching command
 */
function findSimilarCommand(input) {
  let minDistance = Infinity;
  let closestCommand = null;

  for (const cmd of VALID_COMMANDS) {
    const distance = levenshteinDistance(input.toLowerCase(), cmd.toLowerCase());
    // Only suggest if distance is small (likely a typo)
    if (distance < minDistance && distance <= 3) {
      minDistance = distance;
      closestCommand = cmd;
    }
  }

  return closestCommand;
}

async function main() {
  // Show help for no command or explicit help flags
  if (!command || command === "-h" || command === "--help" || command === "help") {
    await runHelp();
    return;
  }

  if (command === "init") {
    await runInit({ args, cwd: process.cwd() });
    return;
  }

  if (command === "run") {
    await runCli({ args, cwd: process.cwd() });
    return;
  }

  if (command === "report@dashboard") {
    await runReportDashboard({ args, cwd: process.cwd() });
    return;
  }

  if (command === "move-secret") {
    await runMoveSecret({ args, cwd: process.cwd() });
    return;
  }

  if (command === "ignore") {
    await runIgnore({ args, cwd: process.cwd() });
    return;
  }

  if (command === "apply") {
    await runApply({ args, cwd: process.cwd() });
    return;
  }

  if (command === "whoami") {
    await runWhoAmI();
    return;
  }

  // Unknown command - provide helpful suggestion
  logError(`Unknown command: ${command}`);
  
  const suggestion = findSimilarCommand(command);
  if (suggestion) {
    logInfo(`\nDid you mean: codeproof ${suggestion}?`);
  } else {
    logInfo("\nRun 'codeproof help' to see available commands.");
  }
  
  process.exit(1);
}

main().catch((error) => {
  logError(error?.message || String(error));
  process.exit(1);
});
