// Help command implementation
// Displays banner and available commands

import { displayBanner } from "../ui/banner.js";
import { formatBlock } from "../ui/formatting.js";

const HELP_TEXT = `Usage: codeproof <command> [options]

Commands:
  codeproof init               Initialize CodeProof in a Git repository
  codeproof run                Run CodeProof checks
  codeproof report@dashboard   Send latest report and show dashboard link
  codeproof move-secret        Move high-risk secrets to .env
  codeproof ignore             Temporarily disable commit enforcement
  codeproof apply              Re-enable commit enforcement
  codeproof whoami             Show the local CodeProof client ID
  codeproof help               Show this help menu
  codeproof -h, --help         Show this help menu

Options for move-secret:
  --dry-run                    Preview changes without modifying files
  --force                      Apply changes without confirmation
  --verbose                    Show detailed output

Examples:
  codeproof move-secret --dry-run    Preview what would be changed
  codeproof move-secret --force      Move secrets without confirmation
  codeproof move-secret              Interactive mode with confirmation


`;

/**
 * Display help information with banner
 */
export async function runHelp() {
  displayBanner();
  formatBlock(HELP_TEXT);
  process.exit(0);
}
