import bcrypt from "bcryptjs";
import type { AuthenticatedContext, Context } from "../../trpc";
import { UnauthorizedError } from "../../lib/errors";

import { cacheService } from "../cache/cache.service";

import { cookieService } from "../cookie/cookie.service";
import { userService } from "../user/user.service";

export const authService = {
  async login(
    input: { email: string; password: string },
    ctx: Context,
  ): Promise<void> {
    try {
      const { user, passwordCorrect } = await userService.checkLogin(
        input.email,
        input.password,
      );

      if (!user || !passwordCorrect) {
        throw UnauthorizedError("Invalid email or password");
      }

      // Updates cache with refresh token
      const { accessToken, refreshToken } = await cacheService.generateTokens(
        user,
        ctx.req,
      );

      // Set the cookies for the client
      cookieService.setAccessToken(ctx, accessToken);
      cookieService.setRefreshToken(ctx, refreshToken);
    } catch (error) {
      console.error("Login error:", (error as Error).message);
      throw error;
    }
  },

  /**
   * Cycles both the accessToken and refreshTokens. If a valid refresh token
   * is not available, a 401 Unauthorized error is thrown
   */
  async refresh(
    ctx: Context,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { refreshToken } = cookieService.getCookieValues(ctx.req, ctx.res);
      if (!refreshToken) {
        throw UnauthorizedError("Refresh token required");
      }

      const { verified, payload } =
        cacheService.verifyRefreshToken(refreshToken);
      if (!verified || !payload?.sessionId) {
        throw UnauthorizedError("Invalid refresh token");
      }

      const tokenData = await cacheService.getRefreshToken(payload.sessionId);
      if (!tokenData) {
        throw UnauthorizedError("Token revoked or expired");
      }

      const user = await userService.getUserById(parseInt(tokenData.userId));
      if (!user) {
        throw UnauthorizedError("Invalid refresh token");
      }

      await cacheService.deleteRefreshToken(tokenData.sessionId);
      const tokens = await cacheService.generateTokens(user, ctx.req);
      cookieService.setAccessToken(ctx, tokens.accessToken);
      cookieService.setRefreshToken(ctx, tokens.refreshToken);
      return tokens;
    } catch (error) {
      // if (error instanceof jwt.JsonWebTokenError) {
      //   throw UnauthorizedError("Invalid refresh token");
      // }
      console.error("Refresh error:", (error as Error).message);
      throw error;
    }
  },

  async logout(ctx: AuthenticatedContext) {
    try {
      const {
        session: { id },
      } = ctx;
      await cacheService.deleteRefreshToken(id);
      cookieService.clearCookies(ctx);
    } catch (error) {
      console.error("Logout error:", (error as Error).message);
      throw error;
    }
  },

  async logoutAllSessions(ctx: AuthenticatedContext) {
    const {
      session: { user },
    } = ctx;
    try {
      await cacheService.revokeUserTokens(user.id.toString());
      cookieService.clearCookies(ctx);
    } catch (error) {
      throw new Error(
        `Logout all sessions failed: ${(error as Error).message}`,
      );
    }
  },

  async register(
    input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
    ctx: Context,
  ): Promise<void> {
    const { firstName, lastName, email, password } = input;

    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      // TODO: create new error type for this
      throw new Error("User with this email already exists.");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      password: passwordHash,
      role: "technician",
    });

    const { accessToken, refreshToken } = await cacheService.generateTokens(
      user,
      ctx.req,
    );

    cookieService.setAccessToken(ctx, accessToken);
    cookieService.setRefreshToken(ctx, refreshToken);
  },
};
