import Link from "next/link";

type ProjectHeaderProps = {
  name: string;
  repoIdentifier?: string | null;
  totalReports: number;
  firstScan?: string | Date | null;
  lastScan?: string | Date | null;
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

export default function ProjectHeader({
  name,
  repoIdentifier,
  totalReports,
  firstScan,
  lastScan,
}: ProjectHeaderProps) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .ph-stat-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          border-radius: 14px;
          padding: 14px 18px;
          min-width: 100px;
          box-sizing: border-box;
        }

        .ph-back {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #94a3b8;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.15s ease;
        }
        .ph-back:hover { color: #64748b; }

        .ph-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          line-height: 1.06;
          letter-spacing: -0.025em;
          color: #0f172a;
          margin-top: 10px;
        }

        .ph-repo {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          color: #94a3b8;
          letter-spacing: 0.02em;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ph-stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .ph-stat-value {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 1.5rem;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin-top: 6px;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Left: title block */}
        <div style={{ minWidth: 0 }}>
          <Link href="/dashboard" className="ph-back">
            ← Dashboard
          </Link>

          <h1 className="ph-name">{name}</h1>

          {repoIdentifier && (
            <p className="ph-repo">
              {/* Git branch icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                  stroke="#94a3b8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M6 9c4 0 6 1.5 6 3v3a3 3 0 0 0 6 0V12"
                  stroke="#94a3b8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {repoIdentifier}
            </p>
          )}
        </div>

        {/* Right: stat pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {[
            { label: "Total reports", value: totalReports.toString() },
            { label: "First scan", value: formatDate(firstScan) },
            { label: "Last scan", value: formatDate(lastScan) },
          ].map((stat) => (
            <div key={stat.label} className="ph-stat-card">
              <p className="ph-stat-label">{stat.label}</p>
              <p className="ph-stat-value">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
