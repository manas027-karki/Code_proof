import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { formatLocalDateKey } from "../utils/date";

export const checkDailyLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await UserModel.findOne({ userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const todayKey = formatLocalDateKey(new Date());
    if (!user.usageDate || user.usageDate !== todayKey) {
      user.dailyUsed = 0;
      user.usageDate = todayKey;
      if (!user.dailyLimit) {
        user.dailyLimit = 50;
      }
      await user.save();
    }

    const limit = user.dailyLimit ?? 50;
    const used = user.dailyUsed ?? 0;

    if (used > limit) {
      res.status(403).json({ message: "Daily run limit exceeded" });
      return;
    }

    next();
  } catch (err) {
    next(err as Error);
  }
};
