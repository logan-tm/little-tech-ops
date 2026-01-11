import Cookies, { type SetOption } from "cookies";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthenticatedContext, Context } from "../trpc";
import UsersController from "./users.controller";
import { UnauthorizedError } from "../lib/errors";

import { CacheController } from "./cache.controller";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

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

export default class AuthController {
  private static getCookies(ctx: Context) {
    return new Cookies(ctx.req, ctx.res, {
      secure: process.env.NODE_ENV === "production",
    });
  }

  private static setCookies(ctx: Context, tokens: AuthTokens) {
    const cookies = this.getCookies(ctx);
    cookies.set("accessToken", tokens.accessToken, {
      ...accessTokenCookieOptions,
    });
    cookies.set("refreshToken", tokens.refreshToken, {
      ...refreshTokenCookieOptions,
    });
    cookies.set("loggedIn", "true", { ...accessTokenCookieOptions });
  }

  private static clearCookies(ctx: Context) {
    const cookies = this.getCookies(ctx);
    cookies.set("accessToken", "", {
      ...accessTokenCookieOptions,
    });
    cookies.set("refreshToken", "", {
      ...refreshTokenCookieOptions,
    });
    cookies.set("loggedIn", "false", { ...accessTokenCookieOptions });
  }

  static async login(
    input: { email: string; password: string },
    ctx: Context
  ): Promise<void> {
    try {
      const { email, password } = input;
      const user = await UsersController.getUserByEmail(email);

      if (!user) {
        throw UnauthorizedError("Invalid email or password.");
      }

      if (!bcrypt.compareSync(password, user.passwordHash)) {
        throw UnauthorizedError("Invalid email or password");
      }

      const tokens = await CacheController.generateTokens(user, ctx.req);
      this.setCookies(ctx, tokens);
    } catch (error) {
      console.error("Login error:", (error as Error).message);
      throw error;
    }
  }

  static async refresh(ctx: AuthenticatedContext): Promise<void> {
    try {
      const cookies = this.getCookies(ctx);
      const refreshToken = cookies.get("refreshToken");
      if (!refreshToken) {
        throw UnauthorizedError("Refresh token required.");
      }

      const { verified, payload } =
        CacheController.verifyRefreshToken(refreshToken);
      if (!verified || !payload?.tokenId) {
        throw UnauthorizedError("Invalid token.");
      }

      const tokenData = await CacheController.getRefreshToken(payload.tokenId);
      if (!tokenData) {
        throw UnauthorizedError("Token revoked or expired.");
      }

      const user = await UsersController.getUserById(
        parseInt(tokenData.userId)
      );
      if (!user) {
        throw UnauthorizedError("User not found.");
      }

      const accessToken = CacheController.generateAccessToken(user);
      cookies.set("accessToken", accessToken, {
        ...accessTokenCookieOptions,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw UnauthorizedError("Invalid refresh token.");
      }
      console.error("Refresh error:", (error as Error).message);
      throw error;
    }
  }

  static async logout(ctx: AuthenticatedContext) {
    try {
      const cookies = this.getCookies(ctx);
      const refreshToken = cookies.get("refreshToken");

      if (!refreshToken) {
        throw UnauthorizedError("Refresh token required");
      }

      const { verified, payload } =
        CacheController.verifyRefreshToken(refreshToken);

      if (verified && payload.tokenId) {
        await CacheController.deleteRefreshToken(payload.tokenId);
      }
      this.clearCookies(ctx);
    } catch (error) {
      console.error("Logout error:", (error as Error).message);
      throw error;
    }
  }

  static async logoutAllSessions(ctx: AuthenticatedContext) {
    const { user } = ctx;
    try {
      await CacheController.revokeUserTokens(user.id.toString());

      this.clearCookies(ctx);
    } catch (error) {
      throw new Error(
        `Logout all sessions failed: ${(error as Error).message}`
      );
    }
  }

  static async register(
    input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
    ctx: Context
  ): Promise<void> {
    const { firstName, lastName, email, password } = input;

    const existingUser = await UsersController.getUserByEmail(email);

    if (existingUser) {
      // TODO: create new error type for this
      throw new Error("User with this email already exists.");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await UsersController.createUser({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "user",
    });

    const tokens = await CacheController.generateTokens(user, ctx.req);

    this.setCookies(ctx, tokens);
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
