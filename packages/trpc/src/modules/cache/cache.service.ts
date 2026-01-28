import jwt from "jsonwebtoken";

import { redis } from "../../lib/redis";
import type { Context } from "../../trpc";
import { randomUUID } from "crypto";
import config from "../../lib/config";

import type {
  JWTPayload,
  JWTVerifyResult,
  RefreshTokenData,
} from "./cache.types";
import { User } from "../user/user.types";

/**
 * Responsible for handling connections to redis, as well as
 * managing tokens.
 *
 * When an access token is issued, a brand new refresh token is also
 * issued.
 */
export const cacheService = {
  /**
   * Create an entry for the refresh key and a set for the user's id.
   * The set stores references to the user's multiple keys.
   *
   * refresh_token:abc-123      → Hash (token data)
   *
   * refresh_token:xyz-456      → Hash (token data)
   *
   * user_tokens:user1          → Set { "abc-123", "jkl-789" }
   *
   * user_tokens:user2          → Set { "xyz-456" }
   */
  async storeRefreshToken(data: RefreshTokenData): Promise<void> {
    const key = `refresh_token:${data.sessionId}`;
    const userKey = `user_tokens:${data.userId}`;
    const ttl = Math.floor((data.expiresAt - Date.now()) / 1000);

    await redis.hset(key, {
      userId: data.userId,
      createdAt: data.createdAt.toString(),
      expiresAt: data.expiresAt.toString(),
      userAgent: data.userAgent || "",
      ipAddress: data.ipAddress || "",
    });

    await redis.expire(key, ttl);

    await redis.sadd(userKey, data.sessionId);
    await redis.expire(userKey, ttl); // Expires the set after the most recent refresh key expires
  },
  async getRefreshToken(sessionId: string): Promise<RefreshTokenData | null> {
    const key = `refresh_token:${sessionId}`;
    const data = await redis.hgetall(key);

    if (!data || !data.userId) return null;

    return {
      userId: data.userId,
      sessionId,
      createdAt: parseInt(data.createdAt),
      expiresAt: parseInt(data.expiresAt),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };
  },
  async deleteRefreshToken(sessionId: string): Promise<void> {
    const data = await this.getRefreshToken(sessionId);
    if (data) {
      await redis.srem(`user_tokens:${data.userId}`, sessionId);
    }
    await redis.del(`refresh_token:${sessionId}`);
  },
  async revokeUserTokens(userId: string): Promise<void> {
    const userKey = `user_tokens:${userId}`;
    const sessionIds = await redis.smembers(userKey);

    const pipeline = redis.multi();
    for (const sessionId of sessionIds) {
      pipeline.del(`refresh_token:${sessionId}`);
    }
    pipeline.del(userKey);
    await pipeline.exec();
  },
  async getUserTokens(userId: string): Promise<RefreshTokenData[]> {
    const sessionIds = await redis.smembers(`user_tokens:${userId}`);
    const tokens: RefreshTokenData[] = [];

    for (const sessionId of sessionIds) {
      const token = await this.getRefreshToken(sessionId);
      if (token) tokens.push(token);
    }

    return tokens;
  },
  verifyAccessToken(token: string): JWTVerifyResult {
    try {
      return {
        verified: true,
        expired: false,
        payload: jwt.verify(
          token,
          config.JWT_ACCESS_TOKEN_SECRET
        ) as JWTPayload,
      };
    } catch (error) {
      const err = error as { name: string; message: string };
      return {
        verified: false,
        expired: err.name === "TokenExpiredError",
        payload: null,
      };
    }
  },
  verifyRefreshToken(token: string): JWTVerifyResult {
    try {
      return {
        verified: true,
        expired: false,
        payload: jwt.verify(
          token,
          config.JWT_REFRESH_TOKEN_SECRET
        ) as JWTPayload,
      };
    } catch (error) {
      const err = error as { name: string; message: string };
      return {
        verified: false,
        expired: err.name === "TokenExpiredError",
        payload: null,
      };
    }
  },
  async generateTokens(user: User, req: Context["req"]) {
    const sessionId = randomUUID();

    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(
      user.id.toString(),
      sessionId
    );

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await this.storeRefreshToken({
      userId: user.id.toString(),
      sessionId,
      createdAt: Date.now(),
      expiresAt,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.socket.remoteAddress,
    });

    return { accessToken, refreshToken };
  },
  generateAccessToken(user: User, sessionId: string): string {
    return jwt.sign({ user, sessionId }, config.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
  },
  generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign({ userId, sessionId }, config.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  },
};
