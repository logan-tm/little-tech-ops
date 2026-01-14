import { z } from "zod/v3";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { authService } from "./auth.service";
import type { UserSession } from "../../types";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authService.register(input, ctx); // also logs user in
    }),
  isAuthenticated: publicProcedure.query(
    async ({
      ctx,
    }): Promise<{ isAuthenticated: boolean; session: UserSession | null }> => {
      const { session } = ctx;
      const isAuthenticated = !!session && session.verified && !session.expired;
      console.log(`CHECKING AUTH STATUS: ${isAuthenticated}`);
      return {
        isAuthenticated,
        session: session || null,
      };
    }
  ),
});
