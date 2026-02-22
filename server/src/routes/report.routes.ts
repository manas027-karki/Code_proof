import { Router } from "express";
import {
	createReportHandler,
	getReportByIdHandler,
} from "../controllers/report.controller";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { authenticateRequest } from "../middlewares/authenticate.middleware";
import { checkDailyLimit } from "../middlewares/checkDailyLimit";
import { EnvConfig } from "../config/env";
import { FeatureFlags } from "../config/featureFlags";

export const reportRouter = (params: {
	env: EnvConfig;
	featureFlags: FeatureFlags;
	jwtSecret: string;
}) => {
	const { env, featureFlags, jwtSecret } = params;
	const router = Router();
	const authMiddleware = [authenticateRequest(jwtSecret), checkDailyLimit];

	if (featureFlags.enableRateLimiting) {
		const rateLimiter = createRateLimiter({
			windowMs: env.rateLimitWindowMs,
			maxRequests: env.rateLimitMax,
		});
		router.post(
			"/api/reports",
			...authMiddleware,
			rateLimiter,
			createReportHandler
		);
	} else {
		router.post("/api/reports", ...authMiddleware, createReportHandler);
	}

	router.get("/api/reports/:reportId", getReportByIdHandler);

	return router;
};
