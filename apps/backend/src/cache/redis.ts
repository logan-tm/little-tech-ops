import { Redis } from "ioredis";
import config from "../lib/config";

const redis = new Redis(config.REDIS_URL);

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export { redis };
