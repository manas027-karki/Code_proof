import Link from "next/link";
import Badge from "./Badge";

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string | Date;
  summary: {
    findings: number;
    blocks: number;
    warnings: number;
    finalVerdict: string;
  };
};

type ReportsTableProps = {
  reports: ReportSummary[];
};

function formatDate(value: string | Date) {
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function verdictVariant(
  verdict: string,
): "allow" | "warn" | "block" | "neutral" {
  const n = verdict.toLowerCase();
  if (n.includes("block")) return "block";
  if (n.includes("warn")) return "warn";
  if (n.includes("allow") || n.includes("pass")) return "allow";
  return "neutral";
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: "13px",
          color: "#94a3b8",
          background: "rgba(255,255,255,0.55)",
          border: "1px dashed rgba(0,0,0,0.08)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        No reports yet. Reports will appear after the next scan.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        width: "100%",
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 60px 80px 50px",
          gap: "16px",
          padding: "10px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        <div>Report ID</div>
        <div>Date</div>
        <div style={{ textAlign: "center" }}>Findings</div>
        <div>Verdict</div>
        <div style={{ textAlign: "right" }}>View</div>
      </div>

      {/* Rows */}
      {reports.map((report, i) => (
        <div
          key={report.reportId}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 60px 80px 50px",
            gap: "16px",
            alignItems: "center",
            padding: "13px 24px",
            borderBottom:
              i < reports.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(29,110,245,0.03)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {/* Report ID */}
          <div
            style={{
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              fontSize: "11px",
              color: "#64748b",
              letterSpacing: "0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {report.reportId}
          </div>

          {/* Date */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: 300,
              color: "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(report.timestamp)}
          </div>

          {/* Findings */}
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "1.1rem",
                color: report.summary.findings > 0 ? "#0f172a" : "#94a3b8",
                letterSpacing: "-0.01em",
              }}
            >
              {report.summary.findings}
            </span>
          </div>

          {/* Verdict badge */}
          <div>
            <Badge
              label={report.summary.finalVerdict}
              variant={verdictVariant(report.summary.finalVerdict)}
            />
          </div>

          {/* View link */}
          <div style={{ textAlign: "right" }}>
            <Link
              href={`/report/${report.reportId}`}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "#1d6ef5",
                textDecoration: "none",
                padding: "5px 12px",
                borderRadius: "100px",
                border: "1px solid rgba(29,110,245,0.20)",
                background: "rgba(29,110,245,0.04)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(29,110,245,0.10)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(29,110,245,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(29,110,245,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(29,110,245,0.20)";
              }}
            >
              View →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
