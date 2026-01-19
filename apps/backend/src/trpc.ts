import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { authService } from "./modules/auth/auth.service";
import { cacheService } from "./modules/cache/cache.service";
import { cookieService } from "./modules/cookie/cookie.service";
import { UnauthorizedError } from "./lib/errors";
import type { UserSession, VerifiedUserSession } from "./types";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  // Pass on the req and res objects to the Context
  // while checking an access token, if any

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
      session,
    };
  }

  if (!accessTokenExists && !refreshTokenExists) {
    // Either never logged in, cleared cookies, or has been gone for a week
    return { req, res };
  }

  if (accessTokenExists && !refreshTokenExists) {
    // There's an issue. Clear access token and log back in
    cookieService.clearCookies({ req, res });
    return { req, res };
  }

  if (!accessTokenExists && refreshTokenExists) {
    // Just needs a refresh
    try {
      const { accessToken: accessTokenAfterRefresh } =
        await authService.refresh({ req, res });
      const { verified, expired, payload } = cacheService.verifyAccessToken(
        accessTokenAfterRefresh
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
        session,
      };
    } catch (error) {
      return { req, res };
    }
  }

  return { req, res };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
export type AuthenticatedContext = Context & {
  session: VerifiedUserSession;
};

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  try {
    const { session } = ctx;

    if (!session || !session.verified || !session.user) {
      throw UnauthorizedError("No valid access token");
    }

    if (session.expired) {
      throw UnauthorizedError("Access token expired");
    }

    return next({
      ctx: {
        ...ctx,
      } as AuthenticatedContext,
    });
  } catch (error) {
    throw UnauthorizedError(
      `Authenticated route failed: ${(error as Error).message}`
    );
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(isAuthenticated);
