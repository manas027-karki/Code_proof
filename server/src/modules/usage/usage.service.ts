import { UserModel, UserDocument } from "../../models/user.model";
import { UsageSnapshot } from "./usage.model";

const DEFAULT_FREE_LIMIT = 20;

const startOfDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const isSameDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() && 
  a.getUTCMonth() === b.getUTCMonth() && 
  a.getUTCDate() === b.getUTCDate();

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildSnapshot = (user: UserDocument): UsageSnapshot => {
  const limit = user.monthlyLimit ?? DEFAULT_FREE_LIMIT;
  const used = user.monthlyUsed ?? 0;
  const remaining = Math.max(limit - used, 0);

  return {
    plan: user.plan || "free",
    limit,
    used,
    remaining,
    usageHistory: user.usageHistory ?? [],
  };
};

const resetUsageIfNeeded = async (user: UserDocument): Promise<boolean> => {
  const now = new Date();
  if (!user.resetAt || !isSameDay(user.resetAt, now)) {
    user.monthlyUsed = 0;
    user.usageHistory = [];
    user.monthlyLimit = user.monthlyLimit ?? DEFAULT_FREE_LIMIT;
    user.resetAt = startOfDay(now);
    await user.save();
    return true;
  }
  return false;
};

export const checkAndIncrementUsage = async (clientId: string) => {
  const user = await UserModel.findOne({ linkedClientIds: clientId });
  if (!user) {
    throw new Error("User not found for clientId");
  }

  await resetUsageIfNeeded(user);

  const limit = user.monthlyLimit ?? DEFAULT_FREE_LIMIT;
  const used = user.monthlyUsed ?? 0;

  if (user.plan === "free" && used >= limit) {
    return { allowed: false, ...buildSnapshot(user) };
  }

  user.monthlyUsed = used + 1;
  const todayKey = formatDateKey(new Date());
  const entry = user.usageHistory.find((item) => item.date === todayKey);
  if (entry) {
    entry.count += 1;
  } else {
    user.usageHistory.push({ date: todayKey, count: 1 });
  }

  await user.save();

  return { allowed: true, ...buildSnapshot(user) };
};

export const getUsageForUser = async (userId: string): Promise<UsageSnapshot> => {
  const user = await UserModel.findOne({ userId });
  if (!user) {
    throw new Error("User not found");
  }

  await resetUsageIfNeeded(user);

  return buildSnapshot(user);
};
