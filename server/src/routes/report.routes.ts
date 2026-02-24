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

	// Create a handler that passes feature flags
	const createReportHandlerWithFlags = (req: any, res: any, next: any) => {
		(req as any).featureFlags = featureFlags;
		createReportHandler(req, res, next);
	};

	if (featureFlags.enablePublicReports) {
		// Public reports: no auth required, but still apply rate limiting if enabled
		if (featureFlags.enableRateLimiting) {
			const rateLimiter = createRateLimiter({
				windowMs: env.rateLimitWindowMs,
				maxRequests: env.rateLimitMax,
			});
			router.post(
				"/api/reports",
				rateLimiter,
				createReportHandlerWithFlags
			);
		} else {
			router.post("/api/reports", createReportHandlerWithFlags);
		}
	} else {
		// Private reports: require auth
		if (featureFlags.enableRateLimiting) {
			const rateLimiter = createRateLimiter({
				windowMs: env.rateLimitWindowMs,
				maxRequests: env.rateLimitMax,
			});
			router.post(
				"/api/reports",
				...authMiddleware,
				rateLimiter,
				createReportHandlerWithFlags
			);
		} else {
			router.post("/api/reports", ...authMiddleware, createReportHandlerWithFlags);
		}
	}

	router.get("/api/reports/:reportId", getReportByIdHandler);

	return router;
};
