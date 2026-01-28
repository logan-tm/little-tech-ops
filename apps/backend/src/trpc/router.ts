// import { router } from "../trpc";
import { router } from "@packages/trpc";

import { userRouter } from "../modules/user/user.router";
import { authRouter } from "../modules/auth/auth.router";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
});

export type BackendAppRouter = typeof appRouter;

declare module "@packages/trpc" {
  interface AppRouter extends BackendAppRouter {}
}
