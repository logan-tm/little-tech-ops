import { Redis } from "ioredis";

import { CacheService } from "./service";

export function createCacheService(
  url: string,
  secrets: { accessTokenSecret: string; refreshTokenSecret: string },
): CacheService {
  const redis = new Redis(url);

  redis.on("error", (err) => {
    console.error("Redis error:", err);
  });

  const service = new CacheService(redis, secrets);

  return service;
}

export type { CacheService };
