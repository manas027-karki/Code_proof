"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportBarDatum = {
  name: string;
  reports: number;
};

type ReportsBarChartProps = {
  data: ReportBarDatum[];
};

export default function ReportsBarChart({ data }: ReportsBarChartProps) {
  if (!data.length) {
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
        No project reports available yet.
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
      `}</style>

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
            Reports per project
          </h3>
          <p
            style={{
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: 300,
              color: "#94a3b8",
            }}
          >
            Activity volume across your monitored repositories.
          </p>
        </div>

        <div style={{ marginTop: "24px", height: "256px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-15}
                height={52}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(29,110,245,0.05)" }}
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
                labelStyle={{ fontWeight: 500, marginBottom: "4px" }}
              />
              <Bar
                dataKey="reports"
                radius={[6, 6, 0, 0]}
                fill="url(#barGradient)"
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d6ef5" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
