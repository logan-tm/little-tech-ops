import * as trpcExpress from "@trpc/server/adapters/express";
import { authService } from "../modules/auth/auth.service";
import { cacheService } from "../modules/cache/cache.service";
import { cookieService } from "../modules/cookie/cookie.service";
import type { UserSession } from "../types";

export const createContext = async ({
  req,
  res,
  info,
}: trpcExpress.CreateExpressContextOptions) => {
  // Pass on the req and res objects to the Context
  // while checking an access token, if any.

  const { accessToken, refreshToken } = cookieService.getCookieValues(req, res);

  const accessTokenExists = !!accessToken;
  const refreshTokenExists = !!refreshToken;

  if (accessTokenExists && refreshTokenExists) {
    // Happy path!
    const { verified, expired, payload } =
      cacheService.verifyAccessToken(accessToken);

    const session: UserSession = {
      id: payload?.sessionId || null,
      user: payload?.user || null,
      verified,
      expired,
    };

    return {
      req,
      res,
      info,
      session,
    };
  }

  if (!accessTokenExists && !refreshTokenExists) {
    // Either never logged in, cleared cookies, or has been gone for a week
    return { req, res, info };
  }

  if (accessTokenExists && !refreshTokenExists) {
    // There's an issue. Clear access token and log back in
    cookieService.clearCookies({ req, res });
    return { req, res, info };
  }

  if (!accessTokenExists && refreshTokenExists) {
    // Just needs a refresh
    try {
      const { accessToken: accessTokenAfterRefresh } =
        await authService.refresh({ req, res });
      const { verified, expired, payload } = cacheService.verifyAccessToken(
        accessTokenAfterRefresh,
      );
      const session: UserSession = {
        id: payload?.sessionId || null,
        user: payload?.user || null,
        verified,
        expired,
      };
      return {
        req,
        res,
        info,
        session,
      };
    } catch (error) {
      return { req, res, info };
    }
  }

  return { req, res, info };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
