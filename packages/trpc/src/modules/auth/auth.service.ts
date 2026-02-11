import bcrypt from "bcryptjs";
import type { UserService } from "@packages/database";
import type { CacheService } from "@packages/cache";
import type { CookieService } from "../cookie/cookie.service";
import type { AuthenticatedContext, Context } from "../../context";
import { UnauthorizedError } from "../../lib/errors";

const getRequestMetadataForToken = (req: AuthenticatedContext["req"]) => {
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  return { userAgent, ip };
};

export class AuthService {
  constructor(
    private cacheService: CacheService,
    private cookieService: CookieService,
    private userService: UserService,
  ) {}
  async login(
    input: { email: string; password: string },
    ctx: Context,
  ): Promise<void> {
    try {
      const { user, passwordCorrect } = await this.userService.checkLogin(
        input.email,
        input.password,
      );

      if (!user || !passwordCorrect) {
        throw UnauthorizedError("Invalid email or password");
      }

      // Updates cache with refresh token
      const { accessToken, refreshToken } =
        await this.cacheService.generateTokens(
          user,
          getRequestMetadataForToken(ctx.req),
        );

      // Set the cookies for the client
      this.cookieService.setAccessToken(ctx.req, ctx.res, accessToken);
      this.cookieService.setRefreshToken(ctx.req, ctx.res, refreshToken);
    } catch (error) {
      console.error("Login error:", (error as Error).message);
      throw error;
    }
  }

  /**
   * Cycles both the accessToken and refreshTokens. If a valid refresh token
   * is not available, a 401 Unauthorized error is thrown
   */
  async refresh(
    ctx: Context,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { refreshToken } = this.cookieService.getCookieValues(
        ctx.req,
        ctx.res,
      );
      if (!refreshToken) {
        throw UnauthorizedError("Refresh token required");
      }

      const { verified, payload } =
        this.cacheService.verifyRefreshToken(refreshToken);
      if (!verified || !payload?.sessionId) {
        throw UnauthorizedError("Invalid refresh token");
      }

      const tokenData = await this.cacheService.getRefreshToken(
        payload.sessionId,
      );
      if (!tokenData) {
        throw UnauthorizedError("Token revoked or expired");
      }

      const user = await this.userService.getUserById(
        parseInt(tokenData.userId),
      );
      if (!user) {
        throw UnauthorizedError("Invalid refresh token");
      }

      await this.cacheService.deleteRefreshToken(tokenData.sessionId);
      const tokens = await this.cacheService.generateTokens(
        user,
        getRequestMetadataForToken(ctx.req),
      );
      this.cookieService.setAccessToken(ctx.req, ctx.res, tokens.accessToken);
      this.cookieService.setRefreshToken(ctx.req, ctx.res, tokens.refreshToken);
      return tokens;
    } catch (error) {
      console.error("Refresh error:", (error as Error).message);
      throw error;
    }
  }

  async logout(ctx: AuthenticatedContext) {
    try {
      const {
        session: { id },
      } = ctx;
      await this.cacheService.deleteRefreshToken(id);
      this.cookieService.clearCookies(ctx.req, ctx.res);
    } catch (error) {
      console.error("Logout error:", (error as Error).message);
      throw error;
    }
  }

  async logoutAllSessions(ctx: AuthenticatedContext) {
    const {
      session: { user },
    } = ctx;
    try {
      await this.cacheService.revokeUserTokens(user.id.toString());
      this.cookieService.clearCookies(ctx.req, ctx.res);
    } catch (error) {
      throw new Error(
        `Logout all sessions failed: ${(error as Error).message}`,
      );
    }
  }

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

    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await this.userService.createUser({
      firstName,
      lastName,
      email,
      password: passwordHash,
      role: "technician",
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    const { accessToken, refreshToken } =
      await this.cacheService.generateTokens(
        user,
        getRequestMetadataForToken(ctx.req),
      );

    this.cookieService.setAccessToken(ctx.req, ctx.res, accessToken);
    this.cookieService.setRefreshToken(ctx.req, ctx.res, refreshToken);
  }
}
