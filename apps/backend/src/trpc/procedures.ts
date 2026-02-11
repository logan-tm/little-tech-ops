import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { type Permission, hasPermission } from "@packages/rules";
import { UnauthorizedError } from "../lib/errors";
import type { VerifiedUserSession } from "../types";
import { t } from "./init";

// export type AuthenticatedContext = Context & {
//   session: VerifiedUserSession;
// };

export type AuthenticatedContext = CreateExpressContextOptions & {
  session: VerifiedUserSession;
};

export const publicProcedure = t.procedure;

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
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
        `Authenticated route failed: ${(error as Error).message}`,
      );
    }
  },
);

export const procedurePermittedBy = (permission: Permission) => {
  return authenticatedProcedure.use(async ({ ctx, next }) => {
    if (!hasPermission(permission).evaluate(ctx.session.user)) {
      throw UnauthorizedError(
        `User with role '${ctx.session.user.role}' lacks permission '${permission}'`,
      );
    }

    return next();
  });
};
