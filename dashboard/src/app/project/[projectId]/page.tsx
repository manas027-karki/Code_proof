"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "../../../lib/api";
import ProjectHeader from "../../../components/ProjectHeader";
import MetricsGrid from "../../../components/MetricsGrid";
import TrendChart from "../../../components/TrendChart";
import ReportsTable from "../../../components/ReportsTable";
import SectionCard from "../../../components/SectionCard";

type ProjectResponse = {
  success: boolean;
  project: {
    projectId: string;
    name: string;
    repoIdentifier: string;
    createdAt: string;
    lastReportAt: string;
  };
};

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string;
  scanMode: string;
  summary: {
    filesScanned: number;
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
  reports: ReportSummary[];
};

type RiskTotals = {
  totalFindings: number;
  totalBlocked: number;
  totalWarnings: number;
  highRisk: number;
};

type RiskPieChartProps = {
  totals: RiskTotals;
};

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  x: number,
  y: number,
  r: number,
  start: number,
  end: number,
) {
  const s = polarToCartesian(x, y, r, end);
  const e = polarToCartesian(x, y, r, start);
  const large = end - start <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function RiskPieChart({ totals }: RiskPieChartProps) {
  const { totalFindings, totalBlocked, totalWarnings, highRisk } = totals;

  if (totalFindings === 0) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontWeight: 300,
          fontSize: "13px",
          color: "#94a3b8",
          background: "rgba(255,255,255,0.55)",
          border: "1px dashed rgba(0,0,0,0.08)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        No findings recorded yet for this project.
      </div>
    );
  }

  const remaining = Math.max(totalFindings - highRisk - totalWarnings, 0);
  const slices = [
    { label: "High-Risk", value: highRisk, color: "url(#riskGrad)" },
    { label: "Warnings", value: totalWarnings, color: "url(#warnGrad)" },
    { label: "Other", value: remaining, color: "rgba(0,0,0,0.08)" },
  ].filter((s) => s.value > 0);

  const total = slices.reduce((s, i) => s + i.value, 0);
  const cx = 60;
  const cy = 60;
  const r = 46;
  let angle = 0;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "28px",
      }}
    >
      {/* SVG donut */}
      <div
        style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}
      >
        <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1d6ef5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="warnGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={10}
          />
          {slices.map((slice) => {
            const sliceAngle = (slice.value / total) * 360;
            const path = describeArc(cx, cy, r, angle, angle + sliceAngle);
            angle += sliceAngle;
            return (
              <path
                key={slice.label}
                d={path}
                fill="none"
                stroke={slice.color}
                strokeWidth={10}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Total
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontSize: "1.5rem",
              color: "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {totalFindings}
          </span>
        </div>
      </div>

      {/* Legend items */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {[
          {
            label: "Blocked commits",
            value: totalBlocked,
            accent: "rgba(29,110,245,0.15)",
            text: "#1d6ef5",
          },
          {
            label: "Warnings",
            value: totalWarnings,
            accent: "rgba(245,158,11,0.12)",
            text: "#b45309",
          },
          {
            label: "High-risk findings",
            value: highRisk,
            accent: "rgba(0,0,0,0.04)",
            text: "#0f172a",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              background: item.accent,
              borderRadius: "10px",
              padding: "8px 12px",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: item.text,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontSize: "1.1rem",
                color: item.text,
                letterSpacing: "-0.01em",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "11px",
            fontWeight: 300,
            color: "#94a3b8",
            marginTop: "4px",
          }}
        >
          Percentages calculated from total findings across loaded reports.
        </p>
      </div>
    </div>
  );
}

const PAGE_LIMIT = 50;
const MAX_REPORTS = 200;

export default function ProjectMetricsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  const [project, setProject] = useState<ProjectResponse["project"] | null>(
    null,
  );
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let isActive = true;

    const loadProject = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const projectResponse = await apiFetch<ProjectResponse>(
          `/api/projects/${projectId}`,
        );
        let offset = 0,
          total = 0;
        const collected: ReportSummary[] = [];
        while (offset < MAX_REPORTS) {
          const page = await apiFetch<ReportsResponse>(
            `/api/projects/${projectId}/reports?limit=${PAGE_LIMIT}&offset=${offset}`,
          );
          total = page.totalReports;
          collected.push(...page.reports);
          offset += PAGE_LIMIT;
          if (offset >= total || page.reports.length === 0) break;
        }
        if (!isActive) return;
        setProject(projectResponse.project);
        setReports(collected);
        setTotalReports(total);
        setIsTruncated(total > collected.length);
      } catch (err) {
        if (!isActive) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load project metrics.",
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadProject();
    return () => {
      isActive = false;
    };
  }, [projectId]);

  const helperSuffix = isTruncated
    ? `Based on last ${reports.length} reports`
    : undefined;

  const metrics = useMemo(() => {
    const totalFindings = reports.reduce((s, r) => s + r.summary.findings, 0);
    const totalBlocked = reports.reduce((s, r) => s + r.summary.blocks, 0);
    const totalWarnings = reports.reduce((s, r) => s + r.summary.warnings, 0);
    return [
      {
        label: "Total Findings",
        value: totalFindings.toString(),
        helper: helperSuffix,
      },
      {
        label: "Total Blocked Commits",
        value: totalBlocked.toString(),
        helper: helperSuffix,
        tone: "danger" as const,
      },
      {
        label: "Total Warnings",
        value: totalWarnings.toString(),
        helper: helperSuffix,
        tone: "warning" as const,
      },
      {
        label: "High-Risk Findings",
        value: totalBlocked.toString(),
        helper: helperSuffix,
        tone: "danger" as const,
      },
      {
        label: "Secrets Detected",
        value: "0",
        helper: "Requires finding metadata",
      },
      {
        label: "Dangerous Functions",
        value: "0",
        helper: "Requires finding metadata",
      },
    ];
  }, [reports, helperSuffix]);

  const riskTotals = useMemo<RiskTotals>(
    () => ({
      totalFindings: reports.reduce((s, r) => s + r.summary.findings, 0),
      totalBlocked: reports.reduce((s, r) => s + r.summary.blocks, 0),
      totalWarnings: reports.reduce((s, r) => s + r.summary.warnings, 0),
      highRisk: reports.reduce((s, r) => s + r.summary.blocks, 0),
    }),
    [reports],
  );

  const trendData = useMemo(() => {
    const grouped = new Map<string, { reports: number; blocks: number }>();
    reports.forEach((r) => {
      const d = new Date(r.timestamp);
      if (Number.isNaN(d.getTime())) return;
      const label = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const ex = grouped.get(label) ?? { reports: 0, blocks: 0 };
      grouped.set(label, {
        reports: ex.reports + 1,
        blocks: ex.blocks + r.summary.blocks,
      });
    });
    return Array.from(grouped.entries()).map(([dateLabel, v]) => ({
      dateLabel,
      reports: v.reports,
      blocks: v.blocks,
    }));
  }, [reports]);

  /* ── Skeleton loader ── */
  const SkeletonCard = () => (
    <div
      style={{
        height: "160px",
        background: "rgba(255,255,255,0.55)",
        border: "1px dashed rgba(0,0,0,0.08)",
        borderRadius: "16px",
      }}
    />
  );

  /* ── Not found ── */
  if (notFound) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`}</style>
        <main
          style={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "'DM Sans',sans-serif",
            background:
              "radial-gradient(ellipse 100% 50% at 0% 0%, rgba(134,239,172,0.18) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, rgba(147,210,255,0.14) 0%, transparent 52%), #f8fbf9",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow:
                "0 4px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
              borderRadius: "20px",
              padding: "40px 32px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontSize: "2rem",
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              Project{" "}
              <em
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(130deg,#1d6ef5,#059669)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                not found
              </em>
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 300,
                fontSize: "13px",
                color: "#64748b",
                marginTop: "10px",
                lineHeight: 1.6,
              }}
            >
              The requested project is unavailable or you do not have access.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              style={{
                marginTop: "24px",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                background: "linear-gradient(135deg,#1d6ef5,#0ea5e9)",
                border: "none",
                borderRadius: "100px",
                padding: "10px 24px",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(29,110,245,0.28)",
              }}
            >
              Return to dashboard
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .proj-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 100% 50% at 0% 0%,   rgba(134,239,172,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70%  50% at 100% 20%, rgba(147,210,255,0.14) 0%, transparent 52%),
            #f8fbf9;
        }

        .proj-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .proj-section-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .proj-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          border-radius: 20px;
          padding: 28px;
          min-width: 0;
          box-sizing: border-box;
        }

        .proj-error {
          background: rgba(255,241,242,0.85);
          border: 1px solid rgba(225,29,72,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 300;
          color: #e11d48;
        }

        .proj-back-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #64748b;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 100px;
          padding: 7px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .proj-back-btn:hover {
          background: rgba(255,255,255,1);
          border-color: rgba(0,0,0,0.16);
          color: #0f172a;
        }

        .proj-divider {
          height: 1px;
          background: rgba(0,0,0,0.06);
        }
      `}</style>

      <main className="proj-root">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-0 py-20 sm:px-6">
          {/* Back button */}

          {/* Project header */}
          {project && (
            <ProjectHeader
              name={project.name}
              repoIdentifier={project.repoIdentifier}
              totalReports={totalReports}
              firstScan={
                reports[reports.length - 1]?.timestamp ?? project.createdAt
              }
              lastScan={project.lastReportAt}
            />
          )}

          {error && <p className="proj-error">{error}</p>}

          {/* Metrics */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "112px",
                    background: "rgba(255,255,255,0.55)",
                    border: "1px dashed rgba(0,0,0,0.08)",
                    borderRadius: "16px",
                  }}
                />
              ))}
            </div>
          ) : (
            <MetricsGrid items={metrics} />
          )}

          <div className="proj-divider" />

          {/* Risk overview */}
          <div className="proj-card">
            <div style={{ marginBottom: "20px" }}>
              <h2 className="proj-section-title">
                Risk <em>overview</em>
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
                How blocked commits and warnings contribute to overall findings
                for this project.
              </p>
            </div>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <RiskPieChart totals={riskTotals} />
            )}
          </div>

          {/* Trend chart */}
          <div className="proj-card">
            <div style={{ marginBottom: "20px" }}>
              <h2 className="proj-section-title">
                <em>Historical</em> trends
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
                Report volume and block frequency across the most recent scans.
              </p>
            </div>
            {isLoading ? <SkeletonCard /> : <TrendChart data={trendData} />}
          </div>

          {/* Reports table */}
          <div className="proj-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "24px 28px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  className="proj-section-title"
                  style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)" }}
                >
                  All <em>reports</em>
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
                  All scans associated with this project.
                </p>
              </div>
              {isTruncated && (
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }}
                >
                  Showing {reports.length} of {totalReports}
                </span>
              )}
            </div>
            {isLoading ? (
              <div style={{ padding: "0 28px 24px" }}>
                <SkeletonCard />
              </div>
            ) : (
              <ReportsTable reports={reports} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
