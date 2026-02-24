type UsageSummaryCardProps = {
  plan: "free" | "premium";
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
};

export default function UsageSummaryCard({
  plan,
  used,
  limit,
  remaining,
  percentage,
}: UsageSummaryCardProps) {
  const pct = Number.isFinite(percentage)
    ? Math.min(Math.max(percentage, 0), 100)
    : limit > 0
      ? Math.min((used / limit) * 100, 100)
      : 0;
  const isPremium = plan === "premium";

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
            Token usage
          </h3>
          <p
            style={{
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: 300,
              color: "#94a3b8",
            }}
          >
            Daily run limits and remaining capacity.
          </p>
        </div>

        {/* Plan badge */}
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "100px",
            border: isPremium
              ? "1px solid rgba(52,211,153,0.25)"
              : "1px solid rgba(0,0,0,0.08)",
            background: isPremium
              ? "rgba(52,211,153,0.10)"
              : "rgba(0,0,0,0.03)",
            color: isPremium ? "#059669" : "#64748b",
          }}
        >
          {plan}
        </span>
      </div>

      {/* Stat boxes */}
      <div
        className="grid gap-4 sm:grid-cols-2"
        style={{ marginBottom: "20px" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Used
          </p>
          <p
            style={{
              marginTop: "8px",
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontSize: "2rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#0f172a",
            }}
          >
            {used}
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                fontWeight: 300,
                color: "#94a3b8",
                marginLeft: "6px",
              }}
            >
              / {limit}
            </span>
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Remaining
          </p>
          <p
            style={{
              marginTop: "8px",
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontSize: "2rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: remaining <= 0 ? "#e11d48" : "#0f172a",
            }}
          >
            {remaining}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>
            Usage
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 400,
              color: pct >= 90 ? "#e11d48" : "#94a3b8",
            }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: "5px",
            borderRadius: "100px",
            background: "rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "100px",
              width: `${pct}%`,
              background:
                pct >= 90
                  ? "linear-gradient(90deg, #e11d48, #f43f5e)"
                  : "linear-gradient(90deg, #1d6ef5, #06b6d4, #059669)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
