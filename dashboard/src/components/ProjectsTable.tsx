import Link from "next/link";

type ProjectRow = {
  projectId: string;
  name: string;
  reportCount: number;
  lastReportAt?: string | Date | null;
};

type ProjectsTableProps = {
  projects: ProjectRow[];
};

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
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
        No projects yet. Run CodeProof on a repo to start tracking reports.
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
          gridTemplateColumns: "1fr auto auto auto",
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
        <div>Project</div>
        <div style={{ textAlign: "center", minWidth: "60px" }}>Reports</div>
        <div style={{ textAlign: "center", minWidth: "90px" }}>Last scan</div>
        <div style={{ textAlign: "right", minWidth: "50px" }}>View</div>
      </div>

      {/* Rows */}
      {projects.map((project, i) => (
        <div
          key={project.projectId}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "16px",
            alignItems: "center",
            padding: "14px 24px",
            borderBottom:
              i < projects.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(29,110,245,0.03)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {/* Name */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {project.name}
          </div>

          {/* Reports count */}
          <div style={{ textAlign: "center", minWidth: "60px" }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "1.1rem",
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              {project.reportCount}
            </span>
          </div>

          {/* Last scan */}
          <div
            style={{
              textAlign: "center",
              minWidth: "90px",
              fontSize: "12px",
              fontWeight: 300,
              color: "#94a3b8",
            }}
          >
            {formatDate(project.lastReportAt)}
          </div>

          {/* View link */}
          <div style={{ textAlign: "right", minWidth: "50px" }}>
            <Link
              href={`/project/${project.projectId}`}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "#1d6ef5",
                textDecoration: "none",
                padding: "5px 12px",
                borderRadius: "100px",
                border: "1px solid rgba(29,110,245,0.2)",
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
