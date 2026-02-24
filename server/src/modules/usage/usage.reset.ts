import { UserModel } from "../../models/user.model";
import { formatLocalDateKey } from "../../utils/date";
import { logger } from "../../utils/logger";

const getNextLocalMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
};

export const scheduleDailyUsageReset = () => {
  const scheduleNext = () => {
    const now = new Date();
    const next = getNextLocalMidnight();
    const delay = Math.max(next.getTime() - now.getTime(), 0);

    logger.info("Scheduled daily usage reset", { nextRun: next.toISOString() });

    setTimeout(async () => {
      try {
        const todayKey = formatLocalDateKey(new Date());
        const result = await UserModel.updateMany(
          {},
          { $set: { dailyUsed: 0, usageDate: todayKey } }
        );

        logger.info("Daily usage reset completed", {
          date: todayKey,
          matched: result.matchedCount,
          modified: result.modifiedCount,
        });
      } catch (err) {
        logger.error("Daily usage reset failed", { error: String(err) });
      } finally {
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
};
