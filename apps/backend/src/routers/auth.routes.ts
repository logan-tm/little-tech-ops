import { z } from "zod/v3";
import { publicProcedure, router } from "../trpc";
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
      AuthController.login(input, ctx);
    }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    AuthController.logout(ctx);
  }),
  logoutAllSessions: publicProcedure.mutation(async ({ ctx }) => {
    AuthController.logoutAllSessions(ctx);
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
    .mutation(async ({ input }) => {
      AuthController.register(input);
    }),
  refreshAccessToken: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      AuthController.refreshAccessToken(input, ctx);
    }),
});
