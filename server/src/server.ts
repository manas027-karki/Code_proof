import { createApp } from "./app";
import { connectToDatabase } from "./config/db";
import { loadEnv } from "./config/env";
import { buildFeatureFlags } from "./config/featureFlags";
import { logger } from "./utils/logger";
import { scheduleDailyUsageReset } from "./modules/usage/usage.reset";

/**
 * Server bootstrap entrypoint.
 * Loads environment configuration, connects to MongoDB, and starts HTTP server.
 */
const startServer = async () => {
  const env = loadEnv();
  const featureFlags = buildFeatureFlags(env);

  await connectToDatabase(env.mongoUri);

  scheduleDailyUsageReset();

  const app = createApp({ env, featureFlags });
  app.listen(env.port, () => {
    logger.info("CodeProof backend listening", { port: env.port });
  });
};

startServer().catch((err) => {
  // Prevent crash loops while still surfacing startup errors.
  logger.error("Failed to start server", { error: String(err) });
  process.exit(1);
});
