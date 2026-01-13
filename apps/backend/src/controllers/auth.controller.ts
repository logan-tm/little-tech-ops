import bcrypt from "bcryptjs";
import type { AuthenticatedContext, Context } from "../trpc";
import UsersController from "./users.controller";
import { UnauthorizedError } from "../lib/errors";

import { CacheController } from "./cache.controller";

import { CookieController } from "./cookie.controller";

export default class AuthController {
  static async login(
    input: { email: string; password: string },
    ctx: Context
  ): Promise<void> {
    try {
      const { user, passwordCorrect } = await UsersController.checkLogin(
        input.email,
        input.password
      );

      if (!user || !passwordCorrect) {
        throw UnauthorizedError("Invalid email or password");
      }

      // Updates cache with refresh token
      const { accessToken, refreshToken } =
        await CacheController.generateTokens(user, ctx.req);

      // Set the cookies for the client
      CookieController.setAccessToken(ctx, accessToken);
      CookieController.setRefreshToken(ctx, refreshToken);

      console.log("SET COOKIES");
    } catch (error) {
      console.error("Login error:", (error as Error).message);
      throw error;
    }
  }

  /**
   * Cycles both the accessToken and refreshTokens. If a valid refresh token
   * is not available, a 401 Unauthorized error is thrown
   */
  static async refresh(ctx: Context): Promise<void> {
    try {
      const { refreshToken } = CookieController.getCookieValues(
        ctx.req,
        ctx.res
      );
      if (!refreshToken) {
        throw UnauthorizedError("Refresh token required");
      }

      const { verified, payload } =
        CacheController.verifyRefreshToken(refreshToken);
      if (!verified || !payload?.sessionId) {
        throw UnauthorizedError("Invalid refresh token");
      }

      const tokenData = await CacheController.getRefreshToken(
        payload.sessionId
      );
      if (!tokenData) {
        throw UnauthorizedError("Token revoked or expired");
      }

      const user = await UsersController.getUserById(
        parseInt(tokenData.userId)
      );
      if (!user) {
        throw UnauthorizedError("Invalid refresh token");
      }

      await CacheController.deleteRefreshToken(tokenData.sessionId);
      const tokens = await CacheController.generateTokens(user, ctx.req);
      CookieController.setAccessToken(ctx, tokens.accessToken);
      CookieController.setRefreshToken(ctx, tokens.refreshToken);
    } catch (error) {
      // if (error instanceof jwt.JsonWebTokenError) {
      //   throw UnauthorizedError("Invalid refresh token");
      // }
      console.error("Refresh error:", (error as Error).message);
      throw error;
    }
  }

  static async logout(ctx: AuthenticatedContext) {
    try {
      const {
        session: { id },
      } = ctx;
      await CacheController.deleteRefreshToken(id);
      CookieController.clearCookies(ctx);
    } catch (error) {
      console.error("Logout error:", (error as Error).message);
      throw error;
    }
  }

  static async logoutAllSessions(ctx: AuthenticatedContext) {
    const {
      session: { user },
    } = ctx;
    try {
      await CacheController.revokeUserTokens(user.id.toString());
      CookieController.clearCookies(ctx);
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

    const { accessToken, refreshToken } = await CacheController.generateTokens(
      user,
      ctx.req
    );

    CookieController.setAccessToken(ctx, accessToken);
    CookieController.setRefreshToken(ctx, refreshToken);
  }
}
