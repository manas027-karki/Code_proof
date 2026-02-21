"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type UsageHistoryEntry = {
  date: string;
  count: number;
};

type UsageGraphProps = {
  usageHistory: UsageHistoryEntry[];
  limit: number;
};

function formatLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function UsageGraph({ usageHistory, limit }: UsageGraphProps) {
  if (!usageHistory.length) {
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
        No usage history recorded yet.
      </div>
    );
  }

  const data = [...usageHistory]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({ date: formatLabel(entry.date), runs: entry.count }));

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
          Daily run usage
        </h3>
        <p
          style={{
            marginTop: "4px",
            fontSize: "12px",
            fontWeight: 300,
            color: "#94a3b8",
          }}
        >
          Daily CodeProof executions for the current month — limit {limit}.
        </p>
      </div>

      <div style={{ marginTop: "24px", height: "256px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
          >
            <defs>
              <linearGradient
                id="usageStrokeGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#1d6ef5" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
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
            {/* Limit reference line — subtle rose, dashed */}
            <ReferenceLine
              y={limit}
              stroke="rgba(225,29,72,0.35)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Limit (${limit})`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "rgba(225,29,72,0.55)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <Line
              type="monotone"
              dataKey="runs"
              stroke="url(#usageStrokeGradient)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1d6ef5", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "#1d6ef5",
                strokeWidth: 2,
                stroke: "rgba(29,110,245,0.2)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
