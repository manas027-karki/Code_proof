"use client";
import { useEffect, useRef } from "react";

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
  // If already in YYYY-MM-DD format, return as-is (assumed to be UTC)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // Parse and use UTC to match server's UTC-based date keys
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets UTC date key to match server's UTC-based date keys.
 * Server uses UTC to ensure consistency across timezones.
 */
function getLocalDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    // Create date in UTC to match server's UTC-based date keys
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const CHART_HEIGHT = 256;
const Y_AXIS_WIDTH = 35;
const MAX_USAGE = 30;

export default function UsageGraph({ usageHistory, limit }: UsageGraphProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [usageHistory.length]);

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
    // Server sends UTC date strings like "2024-01-15" (YYYY-MM-DD format)
    // Use them directly since server now uses UTC
    let key: string;
    if (/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      // Server date is already in UTC format, use as-is
      key = entry.date;
    } else {
      // Fallback: parse and convert to UTC date key
      key = toDateKey(entry.date);
    }
    usageByDate.set(key, (usageByDate.get(key) ?? 0) + entry.count);
  });

  // Use UTC date to match server's UTC date keys
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  // Create start of month in UTC
  const startYear = now.getUTCFullYear();
  const startMonth = now.getUTCMonth();
  const endDate = fromDateKey(todayKey);

  const data: { date: string; runs: number }[] = [];
  // Iterate through dates using UTC to avoid timezone shifts
  const startDate = new Date(Date.UTC(startYear, startMonth, 1));
  let current = new Date(startDate);
  
  while (current <= endDate) {
    // Use UTC date key to match server's UTC-based date keys
    const key = getLocalDateKey(current);
    data.push({ date: key, runs: usageByDate.get(key) ?? 0 });
    
    // Increment using UTC methods to avoid timezone issues
    current = new Date(Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate() + 1
    ));
  }

  const chartWidth = Math.max(data.length * 56, 520);
  const sharedMargin = { top: 8, right: 16, bottom: 8, left: 0 };

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

      <div style={{ marginTop: "24px", height: `${CHART_HEIGHT}px`, display: "flex" }}>

        {/* ── Fixed Y-axis panel — no overflow, no flex:1 ── */}
        <div style={{ flexShrink: 0 }}>
          <LineChart
            data={data}
            width={Y_AXIS_WIDTH + 16}
            height={CHART_HEIGHT}
            margin={{ ...sharedMargin, left: 0, right: 0 }}
          >
            <YAxis
              width={Y_AXIS_WIDTH}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, MAX_USAGE]}
            />
            {/* Invisible line to keep scale in sync */}
            <Line dataKey="runs" dot={false} stroke="transparent" />
          </LineChart>
        </div>

        {/* ── Scrollable chart area — ref lives here ── */}
        <div
          ref={scrollRef}
          style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto", overflowX: "auto" }}
        >
          <LineChart
            data={data}
            width={chartWidth}
            height={CHART_HEIGHT}
            margin={sharedMargin}
          >

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
            {/* Hidden Y-axis to maintain correct internal scaling */}
            <YAxis hide domain={[0, MAX_USAGE]} />
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
              y={limit}
              stroke="#dc2626"
              strokeWidth={0.5}
              label={{
                value: `Limit (${limit})`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#dc2626",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <Line
              type="monotone"
              dataKey="runs"
              stroke="#1d6ef5"
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