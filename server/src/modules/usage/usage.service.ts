import { UserModel, UserDocument } from "../../models/user.model";
import { UsageSnapshot } from "./usage.model";
import { formatLocalDateKey } from "../../utils/date";

const DEFAULT_DAILY_LIMIT = 50;

const buildSnapshot = (user: UserDocument): UsageSnapshot => {
  const limit = user.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const used = user.dailyUsed ?? 0;
  const remaining = Math.max(limit - used, 0);
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return {
    plan: user.plan || "free",
    dailyLimit: limit,
    used,
    remaining,
    percentage,
    usageHistory: user.usageHistory ?? [],
  };
};

const resetUsageIfNeeded = async (user: UserDocument): Promise<boolean> => {
  const todayKey = formatLocalDateKey(new Date());
  if (!user.usageDate || user.usageDate !== todayKey) {
    user.dailyUsed = 0;
    user.dailyLimit = user.dailyLimit ?? DEFAULT_DAILY_LIMIT;
    user.usageDate = todayKey;
    await user.save();
    return true;
  }
  return false;
};

export const incrementDailyUsageForUser = async (userId: string) => {
  const user = await UserModel.findOne({ userId });
  if (!user) {
    throw new Error("User not found");
  }

  await resetUsageIfNeeded(user);

  const limit = user.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const used = user.dailyUsed ?? 0;
  const todayKey = formatLocalDateKey(new Date());

  user.dailyUsed = used + 1;
  const entry = user.usageHistory.find((item) => item.date === todayKey);
  if (entry) {
    entry.count += 1;
  } else {
    user.usageHistory.push({ date: todayKey, count: 1 });
  }

  if (!user.usageDate || user.usageDate !== todayKey) {
    user.usageDate = todayKey;
  }

  if (!user.dailyLimit) {
    user.dailyLimit = limit;
  }

  await user.save();

  return buildSnapshot(user);
};

export const checkAndIncrementUsage = async (clientId: string) => {
  const user = await UserModel.findOne({ linkedClientIds: clientId });
  if (!user) {
    throw new Error("User not found for clientId");
  }

  await resetUsageIfNeeded(user);

  const limit = user.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const used = user.dailyUsed ?? 0;

  if (used >= limit) {
    return { allowed: false, ...buildSnapshot(user) };
  }

  const todayKey = formatLocalDateKey(new Date());
  user.dailyUsed = used + 1;
  if (!user.usageHistory) {
    user.usageHistory = [];
  }
  const entry = user.usageHistory.find((item) => item.date === todayKey);
  if (entry) {
    entry.count += 1;
  } else {
    user.usageHistory.push({ date: todayKey, count: 1 });
  }

  if (!user.usageDate || user.usageDate !== todayKey) {
    user.usageDate = todayKey;
  }

  if (!user.dailyLimit) {
    user.dailyLimit = limit;
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

  const snapshot = buildSnapshot(user);
  
  // Ensure usageHistory is always an array and properly formatted
  if (!Array.isArray(snapshot.usageHistory)) {
    snapshot.usageHistory = [];
  }
  
  // Sort usage history by date (newest first) for consistent display
  snapshot.usageHistory.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  return snapshot;
};
