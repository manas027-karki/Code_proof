"use client";

import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type BlockedPieChartProps = {
  blocked: number;
  allowed: number;
};

const COLORS = ["#1d6ef5", "#059669"];

export default function BlockedPieChart({
  blocked,
  allowed,
}: BlockedPieChartProps) {
  const total = blocked + allowed;

  if (total === 0) {
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
        No commit decisions recorded yet.
      </div>
    );
  }

  const data = [
    { name: "Blocked", value: blocked },
    { name: "Allowed", value: allowed },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h3
          style={{
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          Blocked commit distribution
        </h3>
        <p
          style={{
            marginTop: "4px",
            fontSize: "12px",
            fontWeight: 300,
            color: "#94a3b8",
          }}
        >
          Share of blocked versus allowed security checks.
        </p>
      </div>

      <div style={{ marginTop: "24px", height: "256px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="blockedGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1d6ef5" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="allowedGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={3}
              strokeWidth={0}
            >
              <Cell key="blocked" fill="url(#blockedGradient)" />
              <Cell key="allowed" fill="url(#allowedGradient)" />
            </Pie>
            <Tooltip
              contentStyle={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.07)",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                color: "#0f172a",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#64748b",
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
