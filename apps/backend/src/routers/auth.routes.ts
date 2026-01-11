import { z } from "zod/v3";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import AuthController from "../controllers/auth.controller";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await AuthController.login(input, ctx);
    }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await AuthController.logout(ctx);
  }),
  logoutAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
    await AuthController.logoutAllSessions(ctx);
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
      await AuthController.register(input, ctx); // also logs user in
    }),
  refreshAccessToken: protectedProcedure.mutation(async ({ ctx }) => {
    await AuthController.refresh(ctx);
  }),
  user: protectedProcedure.query(async ({ ctx }) => {
    return AuthController.getUser(ctx);
  }),
  isAuthenticated: publicProcedure.query(async ({ ctx }) => {
    return !!ctx.user;
  }),
});
