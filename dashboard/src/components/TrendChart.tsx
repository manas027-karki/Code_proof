type TrendPoint = {
  dateLabel: string;
  reports: number;
  blocks: number;
};

type TrendChartProps = {
  data: TrendPoint[];
};

function buildSmoothPath(
  points: number[],
  width: number,
  height: number,
  padding = 8,
): string {
  if (points.length === 0) return "";
  const max = Math.max(...points, 1);
  const stepX = width / Math.max(points.length - 1, 1);

  const coords = points.map((value, index) => ({
    x: index * stepX,
    y: padding + (height - padding * 2) * (1 - value / max),
  }));

  if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;

  let d = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cpx = (coords[i].x + coords[i + 1].x) / 2;
    d += ` C ${cpx},${coords[i].y} ${cpx},${coords[i + 1].y} ${coords[i + 1].x},${coords[i + 1].y}`;
  }
  return d;
}

function buildAreaPath(
  points: number[],
  width: number,
  height: number,
  padding = 8,
): string {
  if (points.length === 0) return "";
  const linePath = buildSmoothPath(points, width, height, padding);
  const lastX = width;
  const firstX = 0;
  return `${linePath} L ${lastX},${height} L ${firstX},${height} Z`;
}

export default function TrendChart({ data }: TrendChartProps) {
  if (data.length < 2) {
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
        Not enough data to show trends yet.
      </div>
    );
  }

  const W = 420;
  const H = 120;

  const reportsPath = buildSmoothPath(
    data.map((d) => d.reports),
    W,
    H,
  );
  const blocksPath = buildSmoothPath(
    data.map((d) => d.blocks),
    W,
    H,
  );
  const reportsArea = buildAreaPath(
    data.map((d) => d.reports),
    W,
    H,
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "13.5px",
              fontWeight: 500,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            Activity trend
          </h3>
          <p
            style={{
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: 300,
              color: "#94a3b8",
            }}
          >
            Reports and blocks over time.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            <span
              style={{
                width: 20,
                height: 2,
                borderRadius: 1,
                background: "linear-gradient(90deg,#1d6ef5,#059669)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Reports
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            <span
              style={{
                width: 20,
                height: 2,
                borderRadius: 1,
                background: "rgba(225,29,72,0.50)",
                display: "inline-block",
                flexShrink: 0,
                borderTop: "1px dashed rgba(225,29,72,0.5)",
              }}
            />
            Blocks
          </span>
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "128px", display: "block" }}
        role="img"
        aria-label="Reports and blocks trend"
      >
        <defs>
          <linearGradient id="tcReportsStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d6ef5" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="tcReportsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d6ef5" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#1d6ef5" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill under reports line */}
        <path d={reportsArea} fill="url(#tcReportsArea)" />

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            y1={H * t}
            x2={W}
            y2={H * t}
            stroke="rgba(0,0,0,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Reports line */}
        <path
          d={reportsPath}
          fill="none"
          stroke="url(#tcReportsStroke)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blocks line — dashed rose */}
        <path
          d={blocksPath}
          fill="none"
          stroke="rgba(225,29,72,0.45)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {/* Dots on reports line */}
        {data.map((point, i) => {
          const max = Math.max(...data.map((d) => d.reports), 1);
          const stepX = W / Math.max(data.length - 1, 1);
          const x = i * stepX;
          const y = 8 + (H - 16) * (1 - point.reports / max);
          return (
            <circle
              key={point.dateLabel}
              cx={x}
              cy={y}
              r={3}
              fill="#1d6ef5"
              fillOpacity={0.85}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      {/* Date chips */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {data.slice(-5).map((point) => (
          <div
            key={point.dateLabel}
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              color: "#64748b",
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "100px",
              padding: "3px 10px",
            }}
          >
            {point.dateLabel}
            <span style={{ color: "#1d6ef5", marginLeft: "4px" }}>
              {point.reports}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
