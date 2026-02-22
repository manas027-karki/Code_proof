"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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

function toDateKey(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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

  const usageByDate = new Map<string, number>();
  usageHistory.forEach((entry) => {
    const key = toDateKey(entry.date);
    usageByDate.set(key, (usageByDate.get(key) ?? 0) + entry.count);
  });

  const todayKey = toDateKey(new Date().toISOString());
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = fromDateKey(todayKey);

  const data: { date: string; runs: number }[] = [];
  for (
    let current = new Date(startDate);
    current <= endDate;
    current.setDate(current.getDate() + 1)
  ) {
    const key = toDateKey(current.toISOString());
    data.push({ date: key, runs: usageByDate.get(key) ?? 0 });
  }

  const maxUsage = 30;
  const limitLine = limit;
  const chartWidth = Math.max(data.length * 56, 520);

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
          Daily CodeProof executions — limit {limit} per day.
        </p>
      </div>

      <div style={{ marginTop: "24px", height: "256px" }}>
        <div style={{ overflowX: "auto" }}>
          <LineChart
            data={data}
            width={chartWidth}
            height={256}
            margin={{ top: 8, right: 16, left: -8, bottom: 8 }}
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
              ticks={data.map((entry) => entry.date)}
              tickFormatter={formatLabel}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              interval={0}
              minTickGap={0}
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
              domain={[0, maxUsage]}
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
            <ReferenceLine
              y={limitLine}
              stroke="#dc2626"
              strokeWidth={0.5}
              label={{
                value: `Limit (${limitLine})`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#dc2626",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <Line
              type="monotone"
              dataKey="runs"
              stroke="url(#usageStrokeGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#1d6ef5" }}
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
}
