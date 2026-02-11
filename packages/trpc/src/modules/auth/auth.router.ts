import { z } from "zod/v3";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { router } from "../../index";
import { authService } from "./auth.service";
import { permissionService } from "../permission/permission.service";
import type { Permission } from "../permission/permission.types";
import type { UserSession } from "./auth.types";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await authService.login(input, ctx);
    }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await authService.logout(ctx);
  }),
  logoutAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
    await authService.logoutAllSessions(ctx);
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
      await authService.register(input, ctx); // also logs user in
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
      const isAuthenticated =
        session !== undefined && session.verified && !session.expired;
      const permissions =
        isAuthenticated && !!session.user
          ? permissionService.getPermissionsByRole(session.user.role)
          : null;
      // console.log(`CHECKING AUTH STATUS: ${isAuthenticated}`);
      return {
        isAuthenticated,
        session: session || null,
        permissions,
      };
    },
  ),
});
