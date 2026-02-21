import Link from "next/link";
import { apiFetch, ApiError } from "../../../lib/api";

type ReportSummary = {
  filesScanned: number;
  findings: number;
  blocks: number;
  warnings: number;
  finalVerdict: string;
};

type ReportDetails = {
  reportId: string;
  projectId: string;
  timestamp: string;
  scanMode: string;
  summary: ReportSummary;
  createdAt: string;
};

type Finding = {
  findingId: string;
  ruleId: string;
  severity: string;
  confidence: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  explanation: string;
  createdAt: string;
};

type ReportResponse = {
  success: boolean;
  report: ReportDetails;
  findings: Finding[];
};

interface ReportPageProps {
  params: Promise<{ reportId: string }>;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityColor(s: string): string {
  const n = s.toLowerCase();
  if (n.includes("high") || n.includes("critical")) return "#e11d48";
  if (n.includes("med")) return "#b45309";
  return "#64748b";
}

function severityBg(s: string): string {
  const n = s.toLowerCase();
  if (n.includes("high") || n.includes("critical"))
    return "rgba(225,29,72,0.07)";
  if (n.includes("med")) return "rgba(180,83,9,0.07)";
  return "rgba(0,0,0,0.03)";
}

/* ── Shared error/not-found page ── */
function StatusPage({ title, message }: { title: string; message: string }) {
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
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <em
              style={{
                fontStyle: "italic",
                background: "linear-gradient(130deg,#1d6ef5,#059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title.split(" ").at(-1)}
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
            {message}
          </p>
          <Link
            href="/dashboard"
            style={{
              marginTop: "24px",
              display: "inline-block",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#fff",
              background: "linear-gradient(135deg,#1d6ef5,#0ea5e9)",
              borderRadius: "100px",
              padding: "10px 24px",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(29,110,245,0.28)",
            }}
          >
            Return to dashboard
          </Link>
        </div>
      </main>
    </>
  );
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  let data: ReportResponse | null = null;
  let notFound = false;
  let error: string | null = null;

  try {
    data = await apiFetch<ReportResponse>(`/api/reports/${reportId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound = true;
    else
      error =
        err instanceof Error ? err.message : "Unable to load report details.";
  }

  if (notFound)
    return (
      <StatusPage
        title="Report not found"
        message="The requested report is unavailable or you do not have access."
      />
    );
  if (error || !data)
    return (
      <StatusPage
        title="Unable to load"
        message={
          error ?? "An unexpected error occurred while loading this report."
        }
      />
    );

  const { report, findings } = data;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .rp-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 100% 50% at 0% 0%,   rgba(134,239,172,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70%  50% at 100% 20%, rgba(147,210,255,0.14) 0%, transparent 52%),
            #f8fbf9;
        }

        .rp-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          border-radius: 16px;
          padding: 20px;
          min-width: 0;
          box-sizing: border-box;
        }

        .rp-stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .rp-stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 2rem;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin-top: 8px;
        }

        .rp-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.4rem, 3vw, 2rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .rp-section-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rp-divider { height: 1px; background: rgba(0,0,0,0.06); }

        .rp-back {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #64748b;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 100px;
          padding: 7px 16px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }
        .rp-back:hover { background: #fff; border-color: rgba(0,0,0,0.16); color: #0f172a; }

        .rp-proj-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #1d6ef5;
          background: rgba(29,110,245,0.06);
          border: 1px solid rgba(29,110,245,0.20);
          border-radius: 100px;
          padding: 7px 16px;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .rp-proj-link:hover { background: rgba(29,110,245,0.12); border-color: rgba(29,110,245,0.35); }

        /* Findings table */
        .rp-findings-table {
          width: 100%;
          overflow-x: auto;
        }
        .rp-findings-header {
          display: grid;
          grid-template-columns: minmax(0,2fr) 100px 90px 90px minmax(0,2fr);
          gap: 16px;
          padding: 10px 24px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .rp-findings-row {
          display: grid;
          grid-template-columns: minmax(0,2fr) 100px 90px 90px minmax(0,2fr);
          gap: 16px;
          align-items: start;
          padding: 16px 24px;
          transition: background 0.15s ease;
        }
        .rp-findings-row:hover { background: rgba(29,110,245,0.025); }
      `}</style>

      <main className="rp-root">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-0 py-20 sm:px-6">
          {/* Back nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <Link href={`/project/${report.projectId}`} className="rp-back">
              ← Project
            </Link>
          </div>

          {/* Header */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
                borderRadius: "100px",
                padding: "4px 12px",
                marginBottom: "12px",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                  fill="#10b981"
                />
              </svg>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: "0.07em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Report
              </span>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                  fill="#10b981"
                />
              </svg>
            </div>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                fontSize: "clamp(1.8rem,5vw,2.6rem)",
                letterSpacing: "-0.025em",
                color: "#0f172a",
                lineHeight: 1.06,
              }}
            >
              Report{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  background:
                    "linear-gradient(130deg,#1d6ef5 0%,#06b6d4 55%,#059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {report.reportId.slice(0, 8)}…
              </em>
            </h1>

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
              Scan mode:{" "}
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "11px",
                  background: "#0f172a",
                  color: "#34d399",
                  padding: "1px 7px",
                  borderRadius: "5px",
                }}
              >
                {report.scanMode}
              </span>
              {"  ·  "}run at {formatDate(report.timestamp)}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Files scanned",
                value: report.summary.filesScanned.toString(),
                accent: false,
              },
              {
                label: "Findings",
                value: report.summary.findings.toString(),
                accent: false,
              },
              {
                label: "Blocks",
                value: report.summary.blocks.toString(),
                accent: true,
              },
              {
                label: "Verdict",
                value: report.summary.finalVerdict,
                accent: false,
                small: true,
              },
            ].map((stat) => (
              <div key={stat.label} className="rp-card">
                <p className="rp-stat-label">{stat.label}</p>
                <p
                  className={stat.small ? undefined : "rp-stat-value"}
                  style={
                    stat.small
                      ? {
                          fontFamily: "'DM Sans',sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#0f172a",
                          marginTop: "10px",
                          letterSpacing: "-0.01em",
                        }
                      : stat.accent
                        ? {
                            fontFamily: "'Cormorant Garamond',serif",
                            fontWeight: 300,
                            fontSize: "2rem",
                            lineHeight: 1,
                            letterSpacing: "-0.02em",
                            color: "#e11d48",
                            marginTop: "8px",
                          }
                        : undefined
                  }
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rp-divider" />

          {/* Findings section */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 className="rp-section-title">
                Scan <em>findings</em>
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
                Detailed issues detected during this scan.
              </p>
            </div>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "#94a3b8",
                alignSelf: "center",
              }}
            >
              {findings.length} items
            </span>
          </div>

          {findings.length === 0 ? (
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
              No findings were recorded for this report.
            </div>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.68)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow:
                  "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div className="rp-findings-table">
                {/* Table header */}
                <div className="rp-findings-header">
                  <div>Location</div>
                  <div>Rule</div>
                  <div>Severity</div>
                  <div>Confidence</div>
                  <div>Snippet & notes</div>
                </div>

                {/* Rows */}
                {findings.map((finding, i) => (
                  <div
                    key={finding.findingId}
                    className="rp-findings-row"
                    style={{
                      borderBottom:
                        i < findings.length - 1
                          ? "1px solid rgba(0,0,0,0.04)"
                          : "none",
                    }}
                  >
                    {/* Location */}
                    <div style={{ minWidth: 0 }}>
                      <p
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
                        {finding.filePath}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "11px",
                          fontWeight: 300,
                          color: "#94a3b8",
                          marginTop: "3px",
                        }}
                      >
                        Line {finding.lineNumber}
                      </p>
                    </div>

                    {/* Rule */}
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#0f172a",
                        letterSpacing: "0.01em",
                        wordBreak: "break-all",
                      }}
                    >
                      {finding.ruleId}
                    </div>

                    {/* Severity */}
                    <div>
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "10px",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: severityColor(finding.severity),
                          background: severityBg(finding.severity),
                          padding: "3px 8px",
                          borderRadius: "100px",
                          display: "inline-block",
                        }}
                      >
                        {finding.severity}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "12px",
                        fontWeight: 300,
                        color: "#64748b",
                      }}
                    >
                      {finding.confidence}
                    </div>

                    {/* Snippet + explanation */}
                    <div style={{ minWidth: 0 }}>
                      <pre
                        style={{
                          fontFamily: "'JetBrains Mono','Fira Code',monospace",
                          fontSize: "11px",
                          lineHeight: 1.6,
                          background: "#0f172a",
                          color: "#e2e8f0",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          maxHeight: "120px",
                          overflowY: "auto",
                          overflowX: "auto",
                          margin: 0,
                          whiteSpace: "pre",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <code>{finding.codeSnippet}</code>
                      </pre>
                      {finding.explanation && (
                        <p
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: "12px",
                            fontWeight: 300,
                            color: "#64748b",
                            marginTop: "8px",
                            lineHeight: 1.6,
                          }}
                        >
                          {finding.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
