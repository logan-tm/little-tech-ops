import jwt from "jsonwebtoken";

import { usersTable } from "../db/schema";

import { redis } from "../cache/redis";
import { Context } from "../trpc";
import { randomUUID } from "crypto";
import { InferSelectModel } from "drizzle-orm";

interface JWTPayload {
  id: string;
  tokenId?: string;
}

type JWTVerifyBadResult = {
  verified: false;
  payload: null;
};

type JWTVerifyGoodResult = {
  verified: true;
  payload: JWTPayload;
};

type JWTVerifyResult = JWTVerifyGoodResult | JWTVerifyBadResult;

interface RefreshTokenData {
  userId: string;
  tokenId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}

export class CacheController {
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
  static async storeRefreshToken(data: RefreshTokenData): Promise<void> {
    const key = `refresh_token:${data.tokenId}`;
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

    await redis.sadd(userKey, data.tokenId);
    await redis.expire(userKey, ttl);
  }

  static async getRefreshToken(
    tokenId: string
  ): Promise<RefreshTokenData | null> {
    const key = `refresh_token:${tokenId}`;
    const data = await redis.hgetall(key);

    if (!data || !data.userId) return null;

    return {
      userId: data.userId,
      tokenId,
      createdAt: parseInt(data.createdAt),
      expiresAt: parseInt(data.expiresAt),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };
  }

  static async deleteRefreshToken(tokenId: string): Promise<void> {
    const data = await CacheController.getRefreshToken(tokenId);
    if (data) {
      await redis.srem(`user_tokens:${data.userId}`, tokenId);
    }
    await redis.del(`refresh_token:${tokenId}`);
  }

  static async revokeUserTokens(userId: string): Promise<void> {
    const userKey = `user_tokens:${userId}`;
    const tokenIds = await redis.smembers(userKey);

    const pipeline = redis.multi();
    for (const tokenId of tokenIds) {
      pipeline.del(`refresh_token:${tokenId}`);
    }
    pipeline.del(userKey);
    await pipeline.exec();
  }

  static async getUserTokens(userId: string): Promise<RefreshTokenData[]> {
    const tokenIds = await redis.smembers(`user_tokens:${userId}`);
    const tokens: RefreshTokenData[] = [];

    for (const tokenId of tokenIds) {
      const token = await this.getRefreshToken(tokenId);
      if (token) tokens.push(token);
    }

    return tokens;
  }

  static verifyAccessToken(token: string): JWTVerifyResult {
    try {
      return {
        verified: true,
        payload: jwt.verify(
          token,
          process.env.JWT_ACCESS_TOKEN_SECRET!
        ) as JWTPayload,
      };
    } catch (error) {
      return {
        verified: false,
        payload: null,
      };
    }
  }

  static verifyRefreshToken(token: string): JWTVerifyResult {
    try {
      return {
        verified: true,
        payload: jwt.verify(
          token,
          process.env.JWT_REFRESH_TOKEN_SECRET!
        ) as JWTPayload,
      };
    } catch (error) {
      return {
        verified: false,
        payload: null,
      };
    }
  }

  static async generateTokens(
    user: InferSelectModel<typeof usersTable>,
    req: Context["req"]
  ) {
    const tokenId = randomUUID();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id.toString(), tokenId);

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await CacheController.storeRefreshToken({
      userId: user.id.toString(),
      tokenId,
      createdAt: Date.now(),
      expiresAt,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.socket.remoteAddress,
    });

    return { accessToken, refreshToken };
  }

  static generateAccessToken(
    user: InferSelectModel<typeof usersTable>
  ): string {
    return jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15m",
      }
    );
  }

  static generateRefreshToken(userId: string, tokenId: string): string {
    return jwt.sign(
      { userId, tokenId },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );
  }
}
