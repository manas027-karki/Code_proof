import fs from "fs";
import path from "path";
import { ensureGitRepo, getGitRoot, getStagedFiles, getRepoIdentifier, getProjectName } from "../utils/git.js";
import { logError, logInfo, logSuccess, logWarn } from "../utils/logger.js";
import { buildScanTargets } from "../utils/fileScanner.js";
import { runRuleEngine } from "../engine/ruleEngine.js";
import { analyze } from "../engine/aiAnalyzer.js";
import { mergeDecisions } from "../engine/decisionMerger.js";
import { buildAiInputs, buildProjectContext } from "../engine/contextBuilder.js";
import { buildReport } from "../reporting/reportBuilder.js";
import { writeReport } from "../reporting/reportWriter.js";
import { sendReportToServer } from "../utils/apiClient.js";
import { resolveFeatureFlags, isVerbose } from "../core/featureFlags.js";
import { getClientId } from "../core/identity.js";
import { getEnforcementState } from "../core/enforcement.js";
import { checkUsageOrThrow } from "../core/usageCheck.js";
import { scanAiPrompts } from "../scanners/aiPromptScanner.js";
import { scanDependencies } from "../scanners/dependencyScanner.js";
import {
    reportFeatureDisabled,
    warnExperimentalOnce,
    withFailOpenAiEscalation,
    withFailOpenIntegration,
    withFailOpenReporting
} from "../core/safetyGuards.js";
import { randomUUID } from "crypto";

function readConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        logError("Missing codeproof.config.json. Run codeproof init first.");
        process.exit(1);
    }

    try {
        const raw = fs.readFileSync(configPath, "utf8");
        return JSON.parse(raw);
    } catch {
        logError("Invalid codeproof.config.json. Please fix the file.");
        process.exit(1);
    }
}

export async function runCli({ args = [], cwd }) {
    // Boundary: CLI orchestration only. Avoid importing this module in lower layers.
    logInfo("CodeProof run started.");

    ensureGitRepo(cwd);
    const gitRoot = getGitRoot(cwd);
    const configPath = path.join(gitRoot, "codeproof.config.json");
    const config = readConfig(configPath);
    const features = resolveFeatureFlags(config);
    const verbose = isVerbose(config);
    let enforcement = "enabled";
    try {
        enforcement = getEnforcementState(gitRoot);
    } catch (error) {
        logError(error?.message || "Unable to read enforcement state.");
        process.exit(1);
    }
    const isPreCommit = args.includes("--precommit") || Boolean(process.env.CODEPROOF_PRECOMMIT);

    if (isPreCommit && enforcement === "disabled") {
        logWarn("CodeProof enforcement is temporarily disabled.");
        logInfo("Commit allowed.");
        process.exit(0);
    }

    if (!config.scanMode) {
        logError("Config missing scanMode. Expected 'staged' or 'full'.");
        process.exit(1);
    }

    const clientId = getClientId();
    try {
        const usage = await checkUsageOrThrow({ clientId, config });
        if (!usage.allowed) {
            const limit = usage.limit ?? 50;
            const used = usage.used ?? limit;
            logError(`Free limit reached (${used}/${limit} runs/month).`);
            logError("Upgrade to premium to continue.");
            process.exit(1);
        }
    } catch (error) {
        logError("Usage check failed. Unable to reach CodeProof server.");
        logError(error?.message || "Usage enforcement failed.");
        process.exit(1);
    }

    const scanMode = String(config.scanMode).toLowerCase();
    let targets = [];

    if (scanMode === "staged") {
        logInfo("Scan mode: staged");
        targets = buildScanTargets({
            gitRoot,
            scanMode,
            stagedFiles: getStagedFiles(gitRoot)
        });
    } else if (scanMode === "full") {
        logInfo("Scan mode: full");
        targets = buildScanTargets({
            gitRoot,
            scanMode,
            stagedFiles: []
        });
    } else {
        logError("Invalid scanMode. Expected 'staged' or 'full'.");
        process.exit(1);
    }

    if (targets.length === 0) {
        logWarn("No relevant files found. Exiting.");
        // Exit code 0 allows the Git commit to continue.
        process.exit(0);
    }

    const { findings, escalations } = runRuleEngine({ files: targets });
    const projectContext = buildProjectContext({ gitRoot, config });
    let aiInputs = [];
    if (features.aiEscalation) {
        warnExperimentalOnce("Experimental feature enabled: AI escalation.", logWarn);
        aiInputs = buildAiInputs(escalations, projectContext);
        if (aiInputs.length > 0) {
            // Regex-first keeps scans fast; only ambiguous findings go to AI.
            logWarn(`Escalating ${aiInputs.length} findings to AI for contextual analysis`);
        }
    } else {
        reportFeatureDisabled("AI escalation", verbose, logInfo);
    }

    const aiDecisions = aiInputs.length > 0
        ? await withFailOpenAiEscalation(features.aiEscalation, () => analyze(aiInputs, projectContext))
        : [];
    const { blockFindings, warnFindings, aiReviewed, exitCode } = mergeDecisions({
        baselineFindings: [...findings, ...escalations],
        aiDecisions
    });

    // Run AI Prompt Injection & Supply-Chain Scanner (non-blocking, warnings only)
    let aiPromptScan = null;
    try {
        const aiPromptEnabled = config?.aiPromptScanner?.enabled !== false;
        if (aiPromptEnabled) {
            aiPromptScan = await scanAiPrompts({ gitRoot, config });
        }
    } catch (error) {
        logWarn("AI Prompt Injection & Supply-Chain Scanner failed. Continuing without blocking.");
        if (error?.message) {
            logWarn(error.message);
        }
    }

    // Run Dependency Risk & Supply Chain Scanner (non-blocking, warnings only)
    let dependencyScan = null;
    try {
        const depEnabled = config?.dependencyScanner?.enabled !== false;
        if (depEnabled) {
            dependencyScan = await scanDependencies({ gitRoot, config });
        }
    } catch (error) {
        logWarn("Dependency Risk & Supply Chain Scanner failed. Continuing without blocking.");
        if (error?.message) {
            logWarn(error.message);
        }
    }

    if (features.reporting) {
        await withFailOpenReporting(async () => {
            const timestamp = new Date().toISOString();
            const reportId = randomUUID();
            const projectId = config.projectId || "";
            const clientId = getClientId();
            const projectName = getProjectName(gitRoot);
            const repoIdentifier = getRepoIdentifier(gitRoot);
            const report = buildReport({
                projectRoot: gitRoot,
                projectId,
                projectName,
                repoIdentifier,
                clientId,
                reportId,
                scanMode,
                filesScannedCount: targets.length,
                baselineFindings: [...findings, ...escalations],
                aiReviewed,
                timestamp
            });
            // Additive: attach supply-chain scanner results for local reports and future server support.
            report.supplyChain = {
                aiPrompt: aiPromptScan
                    ? {
                        filesScanned: aiPromptScan.filesScanned,
                        risksFound: aiPromptScan.risksFound,
                        scoreImpact: aiPromptScan.scoreImpact
                    }
                    : { skipped: true },
                dependencies: dependencyScan
                    ? {
                        dependenciesScanned: dependencyScan.dependenciesScanned,
                        deprecated: dependencyScan.deprecatedCount,
                        outdated: dependencyScan.outdatedCount,
                        scoreImpact: dependencyScan.scoreImpact,
                        skipped: Boolean(dependencyScan.skipped)
                    }
                    : { skipped: true }
            };
            // Report is saved to file and sent to server regardless of findings
            logInfo("Saving report to file...");
            writeReport({ projectRoot: gitRoot, report });
            logSuccess("Report saved locally.");

            const integration = config?.integration || {};
            const integrationEnabled = features.integration && Boolean(integration.enabled);
            
            // Always send to server in pre-commit or manual mode
            if (integrationEnabled) {
                logInfo("Syncing report to server...");
                await withFailOpenIntegration(async () => {
                    // Network calls are fail-open; never affect exit codes.
                    const result = await sendReportToServer(report, {
                        enabled: true,
                        endpointUrl: integration.endpointUrl
                    });
                    if (result && !result.success) {
                        logWarn(`Failed to sync report: ${result.error || "Unknown error"}`);
                    } else {
                        logSuccess("Report synced to server.");
                    }
                    return result;
                });
            } else {
                reportFeatureDisabled("Integration", verbose, logInfo);
            }
        }, () => {
            logWarn("Failed to process report. Continuing without blocking.");
        });
    } else {
        reportFeatureDisabled("Reporting", verbose, logInfo);
    }

    if (blockFindings.length > 0) {
        logError(`\n❌ CRITICAL ISSUES FOUND (${blockFindings.length}):\n`);
        for (const finding of blockFindings) {
            const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
            logError(`  • ${finding.ruleId.toUpperCase()}`);
            logError(`    File: ${relative}:${finding.line}`);
            logError(`    Issue: ${finding.message}`);
            // console.log(`    Code: ${finding.snippet}`);
            logError("");
        }
    }

    if (warnFindings.length > 0) {
        // Filter to show only HIGH risk warnings
        const highRiskWarnings = warnFindings.filter(f => f.confidence === "high");
        if (highRiskWarnings.length > 0) {
            logWarn(`\n⚠️  HIGH RISK WARNINGS (${highRiskWarnings.length}):\n`);
            for (const finding of highRiskWarnings) {
                const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
                logWarn(`  • ${finding.ruleId.toUpperCase()}`);
                logWarn(`    File: ${relative}:${finding.line}`);
                logWarn(`    Issue: ${finding.message}`);
                // console.log(`    Code: ${finding.snippet}`);
                logWarn("");
            }
        }
        // comment out low risk warnings
        // const lowRiskWarnings = warnFindings.filter(f => f.confidence !== "high");
        // if (lowRiskWarnings.length > 0) {
        //     logWarn(`Baseline warnings (${lowRiskWarnings.length}):`);
        //     for (const finding of lowRiskWarnings) {
        //         const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
        //         logWarn(
        //             `${finding.ruleId} [${finding.severity}/${finding.confidence}] ${relative}:${finding.line} ${finding.message}`
        //         );
        //         logWarn(`  ${finding.snippet}`);
        //     }
        // }
    }

    if (aiReviewed.length > 0) {
        logWarn(`\n🤖 AI-REVIEWED FINDINGS (${aiReviewed.length}):\n`);
        for (const entry of aiReviewed) {
            const { finding, decision } = entry;
            const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
            const verdict = decision.verdict === "block" ? "BLOCKED" : "WARNING";
            logWarn(`  • ${finding.ruleId.toUpperCase()} [${verdict}]`);
            logWarn(`    File: ${relative}:${finding.line}`);
            logWarn(`    Analysis: ${decision.explanation}`);
            if (decision.suggestedFix) {
                logWarn(`    Fix: ${decision.suggestedFix}`);
            }
            logWarn("");
        }
    }

    // Render AI Prompt / Markdown supply-chain scan results
    if (aiPromptScan) {
        const { filesScanned, risksFound, results, scoreImpact } = aiPromptScan;
        logInfo("\nAI Prompt Injection & Supply-Chain Scanner");
        logInfo("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logInfo(`Files scanned for AI prompts & markdown: ${filesScanned}`);
        logInfo(`Files with detected risks: ${risksFound}`);

        for (const entry of results) {
            const relative = path.relative(gitRoot, entry.filePath) || entry.filePath;
            logWarn("⚠ AI Prompt Risk Detected");
            logWarn(`File: ${relative}`);
            logWarn(`Risk: ${entry.riskLevel}`);
            if (entry.reasons && entry.reasons.length > 0) {
                logWarn("Reasons:");
                for (const reason of entry.reasons) {
                    logWarn(`  • ${reason}`);
                }
            }
            if (entry.recommendation) {
                logWarn("Recommendation:");
                logWarn(`  ${entry.recommendation}`);
            } else {
                logWarn("Recommendation:");
                logWarn("  Review AI instruction files before trusting automated tools.");
            }
            logWarn("");
        }

        if (results.length === 0) {
            logSuccess("No suspicious AI prompt or markdown instructions detected.");
        } else {
            logInfo(`AI prompt security score impact: ${scoreImpact}`);
        }
    }

    // Render dependency scan results
    if (dependencyScan) {
        if (dependencyScan.skipped) {
            // Silent skip to avoid noise in repos without package.json
        } else {
            logInfo("\nDependency Risk & Supply Chain Scanner");
            logInfo("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            logInfo(`Dependencies scanned: ${dependencyScan.dependenciesScanned}`);
            logInfo(`Deprecated: ${dependencyScan.deprecatedCount}`);
            logInfo(`Outdated: ${dependencyScan.outdatedCount}`);

            for (const entry of dependencyScan.results) {
                logWarn("⚠ Dependency Risk Detected");
                logWarn(`Package: ${entry.package}`);
                logWarn(`Current: ${entry.current}`);
                logWarn(`Latest: ${entry.latest}`);
                logWarn(`Status: ${entry.status}`);
                if (entry.deprecatedMessage) {
                    logWarn("Deprecated message:");
                    logWarn(`  ${entry.deprecatedMessage}`);
                }
                logWarn("Recommendation:");
                logWarn(`  ${entry.recommendation}`);
                logWarn("");
            }

            if (dependencyScan.results.length === 0) {
                logSuccess("No deprecated or major-outdated dependencies detected.");
            } else {
                logInfo(`Dependency security score impact: ${dependencyScan.scoreImpact}`);
            }
        }
    }

    if (exitCode === 1) {
        // Exit code 1 blocks the Git commit via the pre-commit hook.
        process.exit(1);
    }

    logSuccess("CodeProof run complete.");
    // Exit code 0 allows the Git commit to continue.
    process.exit(0);
}
