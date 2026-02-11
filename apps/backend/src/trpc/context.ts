import * as trpcExpress from "@trpc/server/adapters/express";
import { authService } from "../modules/auth/auth.service";
// import { cacheService } from "../modules/cache/cache.service";
import { cookieService } from "../modules/cookie/cookie.service";
import type { UserSession } from "../types";

import type { CacheService } from "@packages/cache";
import type { UserService } from "@packages/database";

export const createContextWrapper = (services: {
  cacheService: CacheService;
  userService: UserService;
}) => {
  return async (opts: trpcExpress.CreateExpressContextOptions) => {
    const { cacheService, userService } = services;
    const context = await createContext({
      ...opts,
      services: { cacheService, cookieService, userService },
    });
    return {
      ...context,
      cacheService,
      userService,
    };
  };
};

type ContextOptions = trpcExpress.CreateExpressContextOptions & {
  services: {
    cacheService: CacheService;
    cookieService: typeof cookieService;
    userService: UserService;
  };
};

export const createContext = async ({
  req,
  res,
  info,
  services,
}: ContextOptions) => {
  // Pass on the req and res objects to the Context
  // while checking an access token, if any.

  const { accessToken, refreshToken } = services.cookieService.getCookieValues(
    req,
    res,
  );

  const accessTokenExists = !!accessToken;
  const refreshTokenExists = !!refreshToken;

  if (accessTokenExists && refreshTokenExists) {
    // Happy path!
    const { verified, expired, payload } =
      services.cacheService.verifyAccessToken(accessToken);

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
      services,
    };
  }

  if (!accessTokenExists && !refreshTokenExists) {
    // Either never logged in, cleared cookies, or has been gone for a week
    return { req, res, info, session: null, services: { cookieService } };
  }

  if (accessTokenExists && !refreshTokenExists) {
    // There's an issue. Clear access token and log back in
    services.cookieService.clearCookies({ req, res });
    return { req, res, info, session: null, services: { cookieService } };
  }

  if (!accessTokenExists && refreshTokenExists) {
    // Just needs a refresh
    try {
      const { accessToken: accessTokenAfterRefresh } =
        await authService.refresh({ req, res });
      const { verified, expired, payload } =
        services.cacheService.verifyAccessToken(accessTokenAfterRefresh);
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
        services,
      };
    } catch (error) {
      return { req, res, info, session: null, services: { cookieService } };
    }
  }

  return { req, res, info, session: null, services: { cookieService } };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
