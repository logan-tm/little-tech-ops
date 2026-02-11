import type { Permission } from "@packages/rules";
import type { UserSession } from "./auth.types";
import { getPermissionsByRole } from "@packages/rules";
import { z } from "zod/v3";
import { router } from "../../index";
import { authenticatedProcedure, publicProcedure } from "../../procedures";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
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
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
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
      const isAuthenticated
        = session !== undefined && session.verified && !session.expired;
      const permissions
        = isAuthenticated && !!session.user
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
