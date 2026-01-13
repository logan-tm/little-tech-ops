import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { CacheController } from "./controllers/cache.controller";
import {
  TokenExpiredError,
  UnauthorizedError,
  type AppErrorCode,
} from "./lib/errors";
import { CookieController } from "./controllers/cookie.controller";
import type { UserSession, VerifiedUserSession } from "./types";
import AuthController from "./controllers/auth.controller";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  // Pass on the req and res objects to the Context
  // while checking an access token, if any

  const { accessToken, refreshToken } = CookieController.getCookieValues(
    req,
    res
  );

  if (!!accessToken) {
    // Happy path!
    const { verified, expired, payload } =
      CacheController.verifyAccessToken(accessToken);

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
    if (!refreshToken) {
      // Never logged in
      return { req, res };
    } else {
      // Logged in, but auth token expired. Attempt refresh
      try {
        await AuthController.refresh({ req, res });
        const { accessToken: accessTokenAfterRefresh } =
          CookieController.getCookieValues(req, res);
        const { verified, expired, payload } =
          CacheController.verifyAccessToken(accessTokenAfterRefresh!);
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
        console.log(`Error during refresh! ${(error as Error).message}`);
        return { req, res };
      }
    }
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;
export type AuthenticatedContext = Context & {
  session: VerifiedUserSession;
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    let customCode: AppErrorCode = shape.data.code;

    if (error.cause && (error.cause as any).code === "TOKEN_EXPIRED") {
      customCode = "TOKEN_EXPIRED";
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        code: customCode,
      },
    };
  },
});

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  try {
    // Only use unauthorized here. The client will attempt a refresh if necessary

    const { session } = ctx;

    if (!session || !session.verified || !session.user) {
      throw UnauthorizedError("No valid access token");
    }

    if (session.expired) {
      throw TokenExpiredError("Access token expired");
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
