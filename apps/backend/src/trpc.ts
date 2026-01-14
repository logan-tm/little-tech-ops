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

  if (!!accessToken) {
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
  } else {
    console.log("[TRPC] No access token!");
    if (!refreshToken) {
      // Not logged in
      console.log("[TRPC] No refresh token either!");
      return { req, res };
    } else {
      // Logged in, but auth token expired. Attempt refresh
      console.log("[TRPC] Refresh token found, attempting refresh...");
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
        console.log("[TRPC] Tokens refreshed!");
        return {
          req,
          res,
          session,
        };
      } catch (error) {
        console.log(`[TRPC] Error during refresh! ${(error as Error).message}`);
        return { req, res };
      }
    }
  }
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
