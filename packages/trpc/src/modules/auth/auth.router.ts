import type { Permission } from "@packages/rules";
import { getPermissionsByRole } from "@packages/rules";
import { z } from "zod/v4-mini";

import { router } from "../../index";
import { authenticatedProcedure, publicProcedure } from "../../procedures";

import type { UserSession } from "./auth.types";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.email(),
        password: z.string().check(z.minLength(6)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.services.authService.login(input, ctx);
    }),
  logout: authenticatedProcedure.mutation(async ({ ctx }) => {
    await ctx.services.authService.logout(ctx);
  }),
  logoutAllSessions: authenticatedProcedure.mutation(async ({ ctx }) => {
    await ctx.services.authService.logoutAllSessions(ctx);
  }),
  register: publicProcedure
    .input(
      z.object({
        firstName: z.string().check(z.minLength(1)),
        lastName: z.string().check(z.minLength(1)),
        email: z.email(),
        password: z.string().check(z.minLength(6)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.services.authService.register(input, ctx); // also logs user in
    }),
  getSession: publicProcedure.query(
    async ({
      ctx,
    }): Promise<{
      isAuthenticated: boolean;
      session: UserSession | null;
      permissions: Array<Permission> | null;
    }> => {
      const { session } = ctx;
      const isAuthenticated = !!session && session.verified && !session.expired;
      const permissions =
        isAuthenticated && !!session.user
          ? getPermissionsByRole(session.user.role)
          : null;
      return {
        isAuthenticated,
        session: session || null,
        permissions,
      };
    },
  ),
});
