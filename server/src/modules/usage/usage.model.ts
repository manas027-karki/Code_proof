export type UsageHistoryEntry = {
  date: string;
  count: number;
};

export type UsageSnapshot = {
  plan: "free" | "premium";
  dailyLimit: number;
  used: number;
  remaining: number;
  percentage: number;
  usageHistory: UsageHistoryEntry[];
};
