import { Redis } from "ioredis";

/**
 * SINGLE REDIS CONNECTION (BullMQ + app shared)
 * - reused across workers, producers, queues
 * - prevents connection explosion
 */
export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,

  // important for BullMQ stability
  enableReadyCheck: true,
  lazyConnect: false,

  // reconnect strategy (production-safe)
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

/**
 * GLOBAL ERROR HANDLING
 * prevents silent queue failures
 */
redis.on("error", (err) => {
  console.error("[Redis] connection error:", err);
});

redis.on("connect", () => {
  console.log("[Redis] connected");
});

redis.on("ready", () => {
  console.log("[Redis] ready");
});

/**
 * GRACEFUL SHUTDOWN SUPPORT
 * important for serverless / node clusters
 */
export const closeRedis = async () => {
  await redis.quit();
};
