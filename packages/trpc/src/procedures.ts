import { t } from "./root";
import { UserSession } from "./modules/auth/auth.types";
import { AuthenticatedContext } from "./context";
import { type Permission, hasAllPermissions } from "@packages/rules";

export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { req, res, services } = ctx;
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

    return next({
      ctx: {
        ...ctx,
        session,
      },
    });
  }

  if (!accessTokenExists && !refreshTokenExists) {
    // Either never logged in, cleared cookies, or has been gone for a week
    return next({
      ctx: {
        ...ctx,
        session: null,
      },
    });
  }

  if (accessTokenExists && !refreshTokenExists) {
    // There's an issue. Clear access token and log back in
    services.cookieService.clearCookies(req, res);
    return next({
      ctx: {
        ...ctx,
        session: null,
      },
    });
  }

  if (!accessTokenExists && refreshTokenExists) {
    // Just needs a refresh
    try {
      const { accessToken: accessTokenAfterRefresh } =
        await services.authService.refresh(ctx);
      const { verified, expired, payload } =
        services.cacheService.verifyAccessToken(accessTokenAfterRefresh);
      const session: UserSession = {
        id: payload?.sessionId || null,
        user: payload?.user || null,
        verified,
        expired,
      };
      return next({
        ctx: {
          ...ctx,
          session,
        },
      });
    } catch (error) {
      return next({
        ctx: {
          ...ctx,
          session: null,
        },
      });
    }
  }

  return next({
    ctx: {
      ...ctx,
      session: null,
    },
  });
});

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    const { session } = ctx;
    if (!session || !session.verified || session.expired) {
      throw new Error("Unauthorized");
    }
    return next({
      ctx: {
        ...ctx,
        session,
      } as AuthenticatedContext,
    });
  },
);

// example: permissionedProcedure(["LIST:vehicles"]).query(...) => checks if user has "LIST:vehicles" permission before running the query

export const permissionedProcedure = (requiredPermissions: Permission[]) =>
  authenticatedProcedure.use(async ({ ctx, next }) => {
    if (!hasAllPermissions(requiredPermissions).evaluate(ctx.session.user)) {
      throw new Error("Unauthorized");
    }

    return next({ ctx });
  });
