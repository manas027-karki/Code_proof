"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MetricsGrid from "../../components/charts/MetricsGrid";
import ReportsBarChart from "../../components/charts/ReportsBarChart";
import BlockedPieChart from "../../components/charts/BlockedPieChart";
import FindingsLineChart from "../../components/charts/FindingsLineChart";
import UsageGraph from "../../components/UsageGraph";
import UsageSummaryCard from "../../components/UsageSummaryCard";
import ProjectsTable from "../../components/ProjectsTable";
import ReportsTable from "../../components/ReportsTable";
import { apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";

type ProjectSummary = {
  projectId: string;
  name: string;
  repoIdentifier: string;
  createdAt: string;
  lastReportAt: string;
};

type ProjectsResponse = {
  success: boolean;
  projects: ProjectSummary[];
};

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string;
  scanMode: string;
  summary: {
    findings: number;
    blocks: number;
    warnings: number;
    finalVerdict: string;
  };
  createdAt: string;
};

type ReportsResponse = {
  success: boolean;
  projectId: string;
  totalReports: number;
  totalBlocked?: number;
  totalFindings?: number;
  reports: ReportSummary[];
};

type UsageHistoryEntry = {
  date: string;
  count: number;
};

type UsageResponse = {
  plan: "free" | "premium";
  dailyLimit: number;
  used: number;
  remaining: number;
  percentage: number;
  usageHistory: UsageHistoryEntry[];
};

type ProjectWithCounts = ProjectSummary & {
  reportCount: number;
  totalBlocked: number;
  totalFindings: number;
};

const PROJECT_LIMIT = 6;
const REPORTS_PER_PROJECT = 10;
const RECENT_REPORTS_LIMIT = 6;

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [allReports, setAllReports] = useState<ReportSummary[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);

  const recentProjects = useMemo(
    () => projects.slice(0, PROJECT_LIMIT),
    [projects],
  );

  useEffect(() => {
    let isActive = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const projectsResponse =
          await apiFetch<ProjectsResponse>("/api/projects");
        const projectList = projectsResponse.projects ?? [];
        const reportPages = await Promise.all(
          projectList.map(async (project) => {
            try {
              return await apiFetch<ReportsResponse>(
                `/api/projects/${project.projectId}/reports?limit=${REPORTS_PER_PROJECT}&offset=0`,
              );
            } catch {
              return null;
            }
          }),
        );
        if (!isActive) return;

        const projectsWithCounts = projectList.map((project, index) => {
          const page = reportPages[index];
          const reportItems = page?.reports ?? [];
          return {
            ...project,
            reportCount: page?.totalReports ?? reportItems.length,
            totalBlocked:
              page?.totalBlocked ??
              reportItems.reduce((s, r) => s + r.summary.blocks, 0),
            totalFindings:
              page?.totalFindings ??
              reportItems.reduce((s, r) => s + r.summary.findings, 0),
          };
        });

        const reportItems = reportPages.flatMap((page) => page?.reports ?? []);
        reportItems.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        let usageSnapshot: UsageResponse | null = null;
        let usageMessage: string | null = null;
        try {
          usageSnapshot = await apiFetch<UsageResponse>("/api/usage");
        } catch (e) {
          usageMessage =
            e instanceof Error ? e.message : "Unable to load usage metrics.";
        }

        setProjects(projectsWithCounts);
        setAllReports(reportItems);
        setReports(reportItems.slice(0, RECENT_REPORTS_LIMIT));
        setTotalReports(
          projectsWithCounts.reduce((s, p) => s + p.reportCount, 0),
        );
        setUsageData(usageSnapshot);
        setUsageError(usageMessage);
      } catch (err) {
        if (!isActive) return;
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard data.",
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => {
      isActive = false;
    };
  }, []);

  const metrics = useMemo(
    () => ({
      totalProjects: projects.length,
      totalReports,
      blockedCommits: projects.reduce((s, p) => s + p.totalBlocked, 0),
      totalFindings: projects.reduce((s, p) => s + p.totalFindings, 0),
    }),
    [projects, totalReports],
  );

  const metricsItems = useMemo(
    () => [
      {
        label: "Total Projects",
        value: metrics.totalProjects.toString(),
        helper: "Active project scopes",
      },
      {
        label: "Total Reports",
        value: metrics.totalReports.toString(),
        helper: "Reports visible to this account",
      },
      {
        label: "Blocked Commits",
        value: metrics.blockedCommits.toString(),
        helper: `Based on ${metrics.totalReports} total reports`,
        tone: "danger" as const,
      },
      {
        label: "Total Findings",
        value: metrics.totalFindings.toString(),
        helper: `Based on ${metrics.totalReports} total reports`,
        tone: "warning" as const,
      },
    ],
    [metrics],
  );

  const reportsPerProject = useMemo(
    () =>
      projects.map((p) => ({
        name: p.name || p.repoIdentifier || p.projectId,
        reports: p.reportCount,
      })),
    [projects],
  );

  const blockedDistribution = useMemo(
    () => ({
      blocked: metrics.blockedCommits,
      allowed: Math.max(metrics.totalReports - metrics.blockedCommits, 0),
    }),
    [metrics],
  );

  const findingsTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    [...allReports]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .forEach((r) => {
        const key = new Date(r.timestamp).toISOString().slice(0, 10);
        byDate.set(key, (byDate.get(key) ?? 0) + r.summary.findings);
      });
    return Array.from(byDate.entries()).map(([date, findings]) => ({
      dateLabel: formatDateLabel(date),
      findings,
    }));
  }, [allReports]);

  const handleLogout = () => {
    clearToken();
    router.replace("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 100% 50% at 0% 0%,   rgba(134,239,172,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70%  50% at 100% 20%, rgba(147,210,255,0.14) 0%, transparent 52%),
            #f8fbf9;
        }

        /* Section headings */
        .dash-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.4rem, 3vw, 2rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .dash-section-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Page header */
        .dash-header-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: #0f172a;
        }
        .dash-header-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Glassmorphic content cards */
        .dash-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          border-radius: 16px;
          padding: 24px;
          min-width: 0;
          box-sizing: border-box;
        }

        /* Loading skeleton */
        .dash-skeleton {
          background: rgba(255,255,255,0.55);
          border: 1px dashed rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #94a3b8;
        }

        /* Error/warning states */
        .dash-error {
          background: rgba(255,241,242,0.85);
          border: 1px solid rgba(225,29,72,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 300;
          color: #e11d48;
        }
        .dash-warning {
          background: rgba(255,251,235,0.85);
          border: 1px solid rgba(217,119,6,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 300;
          color: #b45309;
        }

        /* Divider */
        .dash-divider {
          height: 1px;
          background: rgba(0,0,0,0.06);
        }

        /* Logout button */
        .dash-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #64748b;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 100px;
          padding: 7px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .dash-logout:hover {
          background: rgba(255,255,255,1);
          border-color: rgba(0,0,0,0.16);
          color: #0f172a;
        }

        /* Logo mark in sidebar */
        .dash-logo-mark {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: linear-gradient(135deg, #1d6ef5 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(29,110,245,0.32);
          flex-shrink: 0;
        }

        .dash-logo-wordmark {
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .dash-logo-wordmark em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 15px;
          background: linear-gradient(130deg, #1d6ef5 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <main className="dash-root">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-0 py-20 lg:flex-row sm:px-6">
          {/* ── Main content ── */}
          <section
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            {/* Page header */}
            <header
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <h1 className="dash-header-title">DASHBOARD</h1>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "6px",
                    lineHeight: 1.6,
                  }}
                >
                  High-level security posture across your connected projects.
                </p>
              </div>
              <button
                type="button"
                className="dash-logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </header>

            {error && <p className="dash-error">{error}</p>}

            {/* Analytics */}
            <section
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <h2 className="dash-section-title">
                  <em>Security</em> analytics
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Visual summary of your project activity and risk signals.
                </p>
              </div>

              {isLoading ? (
                <div className="dash-skeleton">Loading analytics…</div>
              ) : (
                <MetricsGrid items={metricsItems} />
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                {isLoading ? (
                  <div className="dash-skeleton">Loading charts…</div>
                ) : (
                  <div className="dash-card">
                    <ReportsBarChart data={reportsPerProject} />
                  </div>
                )}
                {isLoading ? (
                  <div className="dash-skeleton">Loading charts…</div>
                ) : (
                  <div className="dash-card">
                    <BlockedPieChart
                      blocked={blockedDistribution.blocked}
                      allowed={blockedDistribution.allowed}
                    />
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="dash-skeleton">Loading trends…</div>
              ) : (
                <div className="dash-card">
                  <FindingsLineChart data={findingsTrend} />
                </div>
              )}
            </section>

            <div className="dash-divider" />

            {/* Usage */}
            <section
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <h2 className="dash-section-title">
                  <em>Usage</em> tracking
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Monthly run limits and daily usage volume.
                </p>
              </div>
              {isLoading ? (
                <div className="dash-skeleton">Loading usage metrics…</div>
              ) : usageError ? (
                <p className="dash-warning">{usageError}</p>
              ) : usageData ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="dash-card">
                    <UsageSummaryCard
                      plan={usageData.plan}
                      used={usageData.used}
                      limit={usageData.dailyLimit}
                      remaining={usageData.remaining}
                      percentage={usageData.percentage}
                    />
                  </div>
                  <div className="dash-card">
                    <UsageGraph
                      usageHistory={usageData.usageHistory}
                      limit={usageData.dailyLimit}
                    />
                  </div>
                </div>
              ) : (
                <div className="dash-skeleton">
                  Usage data not available yet.
                </div>
              )}
            </section>

            <div className="dash-divider" />

            {/* Projects */}
            <section
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <h2 className="dash-section-title">
                  Recent <em>projects</em>
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Most active projects connected to your clientId.
                </p>
              </div>
              {isLoading ? (
                <div className="dash-skeleton">Loading projects…</div>
              ) : (
                <div
                  className="dash-card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <ProjectsTable projects={recentProjects} />
                </div>
              )}
            </section>

            <div className="dash-divider" />

            {/* Reports */}
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingBottom: "40px",
              }}
            >
              <div>
                <h2 className="dash-section-title">
                  Recent <em>reports</em>
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Latest security scans across your most active projects.
                </p>
              </div>
              {isLoading ? (
                <div className="dash-skeleton">Loading reports…</div>
              ) : (
                <div
                  className="dash-card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <ReportsTable reports={reports} />
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </>
  );
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
