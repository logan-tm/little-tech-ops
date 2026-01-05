import Cookies, { type SetOption } from "cookies";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { eq, type InferSelectModel } from "drizzle-orm";
import { redis } from "../cache/redis";
import { usersTable } from "../db/schema";
import type { AuthenticatedContext, Context } from "../trpc";
import UsersController from "./users.controller";
import UnauthorizedError from "../lib/errors/UnauthorizedError";

const db = drizzle(process.env.DB_FILE_NAME!);

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const accessTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class TokenController {
  static verifyToken(token: string, type: "access" | "refresh" = "access") {
    try {
      const decoded = jwt.verify(
        token,
        type === "access"
          ? process.env.JWT_ACCESS_TOKEN_SECRET!
          : process.env.JWT_REFRESH_TOKEN_SECRET!
      ) as { userId: number };

      if (!decoded || !decoded.userId) {
        return null;
      }

      return decoded.userId;
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }

  static createAccessToken(userId: number) {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
  }

  static createRefreshToken(userId: number) {
    const token = jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN_SECRET!);
    return token;
  }

  static async setRefreshTokenCache(
    token: string,
    user: InferSelectModel<typeof usersTable>
  ) {
    await redis.set(
      `refresh_token:${token}`,
      JSON.stringify(user),
      "EX",
      7 * 24 * 60 * 60 // 7 days
    );

    await redis.sadd(`refresh_tokens:${user.id}`, token);
    await redis.expire(`refresh_tokens:${user.id}`, 7 * 24 * 60 * 60); // 7 days

    await redis.set(
      `user:${user.id}`,
      JSON.stringify(user),
      "EX",
      7 * 24 * 60 * 60
    ); // 7 days
  }
}

export default class AuthController {
  static async login(input: { email: string; password: string }, ctx: Context) {
    try {
      const { email, password } = input;
      const user = await UsersController.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      if (!bcrypt.compareSync(password, user.passwordHash)) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const accessToken = TokenController.createAccessToken(user.id);

      const refreshToken = TokenController.createRefreshToken(user.id);

      TokenController.setRefreshTokenCache(refreshToken, user);

      const cookies = new Cookies(ctx.req, ctx.res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", accessToken, {
        ...accessTokenCookieOptions,
      });
      cookies.set("refreshToken", refreshToken, {
        ...refreshTokenCookieOptions,
      });
      cookies.set("loggedIn", "true", { ...accessTokenCookieOptions });

      return { message: "Login successful" };
    } catch (error) {
      console.warn("Caught an unexpected error type, re-throwing...");
      throw error;
    }
  }

  static async logout(ctx: AuthenticatedContext) {
    const { req, res, user } = ctx;
    try {
      const cookies = new Cookies(req, res, {
        secure: process.env.NODE_ENV === "production",
      });
      const refreshToken = cookies.get("refreshToken");

      if (refreshToken) {
        await redis.del(`refresh_token:${refreshToken}`);
        await redis.srem(`refresh_tokens:${user.id}`, refreshToken);
      }
      cookies.set("accessToken", "", { ...accessTokenCookieOptions });
      cookies.set("refreshToken", "", { ...refreshTokenCookieOptions });
      cookies.set("loggedIn", "false", { ...accessTokenCookieOptions });
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`);
    }
  }

  static async logoutAllSessions(ctx: AuthenticatedContext) {
    const { req, res, user } = ctx;
    try {
      const refreshTokens = await redis.smembers(`refresh_tokens:${user.id}`);
      const pipeline = redis.pipeline();
      refreshTokens.forEach((token) => {
        pipeline.del(`refresh_token:${token}`);
      });
      pipeline.del(`refresh_tokens:${user.id}`);
      pipeline.del(`user:${user.id}`);
      await pipeline.exec();

      const cookies = new Cookies(req, res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", "", { ...accessTokenCookieOptions });
      cookies.set("refreshToken", "", { ...refreshTokenCookieOptions });
      cookies.set("loggedIn", "false", { ...accessTokenCookieOptions });
    } catch (error) {
      throw new Error(
        `Logout all sessions failed: ${(error as Error).message}`
      );
    }
  }

  static async verifyToken(
    token: string,
    type: "access" | "refresh" = "access"
  ) {
    return TokenController.verifyToken(token, type);
  }

  static async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = input;

    const existingUser = await UsersController.getUserByEmail(email);

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await UsersController.createUser({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "user",
    });

    return { message: "Registration successful" };
  }

  static async refreshAccessToken(input: string, ctx: AuthenticatedContext) {
    try {
      const tokenExists = await redis.get(`refresh_token:${input}`);
      if (!tokenExists) {
        throw new Error("Invalid refresh token");
      }

      // verify the refresh token and gather userId
      const userId = TokenController.verifyToken(input, "refresh");
      if (!userId || userId.toString() !== ctx.user.id.toString()) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = TokenController.createAccessToken(userId);

      const cookies = new Cookies(ctx.req, ctx.res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", accessToken, {
        ...accessTokenCookieOptions,
      });
      cookies.set("loggedIn", "true", { ...accessTokenCookieOptions });

      return accessToken;
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  static getUser(ctx: AuthenticatedContext) {
    // Example user as if fetched from database
    const user = {
      id: ctx.user.id,
      firstName: ctx.user.firstName,
      lastName: ctx.user.lastName,
      email: ctx.user.email,
      role: ctx.user.role,
      permissions: [
        "read_articles",
        "write_articles",
        "delete_comments",
        "ban_users",
      ],
    };
    return user;
  }
}
