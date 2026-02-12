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

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function RiskPieChart({ totals }: RiskPieChartProps) {
  const { totalFindings, totalBlocked, totalWarnings, highRisk } = totals;

  if (totalFindings === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        No findings recorded yet for this project.
      </div>
    );
  }

  const remaining = Math.max(
    totalFindings - highRisk - totalWarnings,
    0,
  );

  const slices = [
    { label: "High-Risk", value: highRisk, color: "#f97373" },
    { label: "Warnings", value: totalWarnings, color: "#fbbf24" },
    { label: "Other", value: remaining, color: "#cbd5f5" },
  ].filter((item) => item.value > 0);

  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const center = 60;
  const radius = 46;
  let currentAngle = 0;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Risk distribution
        </h3>
        <p className="text-xs text-slate-500">
          Breakdown of blocked, warning, and other findings for this project.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative h-32 w-32">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full transition-transform duration-300 ease-out hover:scale-[1.03]"
          >
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={10}
            />
            {slices.map((slice, index) => {
              const sliceAngle = (slice.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + sliceAngle;
              currentAngle = endAngle;

              const pathData = describeArc(
                center,
                center,
                radius,
                startAngle,
                endAngle,
              );

              return (
                <path
                  key={slice.label}
                  d={pathData}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={10}
                  className="transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Total findings
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {totalFindings}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 text-xs text-slate-600">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-rose-50/60 px-3 py-2">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-semibold text-rose-700">
                  Total Blocked Commits
                </span>
              </span>
              <span className="font-mono text-xs text-rose-700">
                {totalBlocked}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50/70 px-3 py-2">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-semibold text-amber-700">
                  Total Warnings
                </span>
              </span>
              <span className="font-mono text-xs text-amber-700">
                {totalWarnings}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-800">
                High-Risk Findings
              </span>
            </span>
            <span className="font-mono text-xs text-slate-700">
              {highRisk}
            </span>
          </div>
          <p className="text-[0.7rem] text-slate-500">
            Percentages are calculated out of total findings across the loaded
            reports for this project.
          </p>
        </div>
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
    if (!projectId) {
      return;
    }

    let isActive = true;

    const loadProject = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const projectResponse = await apiFetch<ProjectResponse>(
          `/api/projects/${projectId}`,
        );

        let offset = 0;
        let total = 0;
        const collected: ReportSummary[] = [];

        while (offset < MAX_REPORTS) {
          const reportsPage = await apiFetch<ReportsResponse>(
            `/api/projects/${projectId}/reports?limit=${PAGE_LIMIT}&offset=${offset}`,
          );

          total = reportsPage.totalReports;
          collected.push(...reportsPage.reports);
          offset += PAGE_LIMIT;

          if (offset >= total || reportsPage.reports.length === 0) {
            break;
          }
        }

        if (!isActive) {
          return;
        }

        setProject(projectResponse.project);
        setReports(collected);
        setTotalReports(total);
        setIsTruncated(total > collected.length);
      } catch (err) {
        if (!isActive) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load project metrics.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isActive = false;
    };
  }, [projectId]);

  const metrics = useMemo(() => {
    const totalFindings = reports.reduce(
      (sum, report) => sum + report.summary.findings,
      0,
    );
    const totalBlocked = reports.reduce(
      (sum, report) => sum + report.summary.blocks,
      0,
    );
    const totalWarnings = reports.reduce(
      (sum, report) => sum + report.summary.warnings,
      0,
    );
    const highRisk = totalBlocked;

    const helperSuffix = isTruncated
      ? `Based on last ${reports.length} reports`
      : undefined;

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
        value: highRisk.toString(),
        helper: helperSuffix,
        tone: "danger" as const,
      },
      {
        label: "Secrets Detected",
        value: "0",
        helper: "Requires finding metadata",
      },
      {
        label: "Dangerous Functions Detected",
        value: "0",
        helper: "Requires finding metadata",
      },
    ];
  }, [reports, isTruncated]);

  const riskTotals = useMemo<RiskTotals>(() => {
    const totalFindings = reports.reduce(
      (sum, report) => sum + report.summary.findings,
      0,
    );
    const totalBlocked = reports.reduce(
      (sum, report) => sum + report.summary.blocks,
      0,
    );
    const totalWarnings = reports.reduce(
      (sum, report) => sum + report.summary.warnings,
      0,
    );

    return {
      totalFindings,
      totalBlocked,
      totalWarnings,
      highRisk: totalBlocked,
    };
  }, [reports]);

  const trendData = useMemo(() => {
    if (reports.length === 0) {
      return [];
    }

    const grouped = new Map<
      string,
      { reports: number; blocks: number }
    >();

    reports.forEach((report) => {
      const date = new Date(report.timestamp);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const label = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const existing = grouped.get(label) ?? { reports: 0, blocks: 0 };
      grouped.set(label, {
        reports: existing.reports + 1,
        blocks: existing.blocks + report.summary.blocks,
      });
    });

    return Array.from(grouped.entries()).map(([dateLabel, values]) => ({
      dateLabel,
      reports: values.reports,
      blocks: values.blocks,
    }));
  }, [reports]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Project not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested project is unavailable or you do not have access.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            Return to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {project ? (
          <ProjectHeader
            name={project.name}
            repoIdentifier={project.repoIdentifier}
            totalReports={totalReports}
            firstScan={reports[reports.length - 1]?.timestamp ?? project.createdAt}
            lastScan={project.lastReportAt}
          />
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-slate-200/70 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <MetricsGrid items={metrics} />
        )}

        <SectionCard
          title="Risk overview"
          description="How blocked commits and warnings contribute to overall findings for this project."
        >
          {isLoading ? (
            <div className="h-40 rounded-2xl border border-slate-200/70 bg-slate-100" />
          ) : (
            <RiskPieChart totals={riskTotals} />
          )}
        </SectionCard>

        <SectionCard
          title="Historical trends"
          description="Report volume and block frequency across the most recent scans."
        >
          {isLoading ? (
            <div className="h-40 rounded-2xl border border-slate-200/70 bg-slate-100" />
          ) : (
            <TrendChart data={trendData} />
          )}
        </SectionCard>

        <SectionCard
          title="Reports"
          description="All scans associated with this project."
          actions={
            isTruncated ? (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Showing {reports.length} of {totalReports}
              </span>
            ) : null
          }
        >
          {isLoading ? (
            <div className="h-40 rounded-2xl border border-slate-200/70 bg-slate-100" />
          ) : (
            <ReportsTable reports={reports} />
          )}
        </SectionCard>
      </div>
    </main>
  );
}
