import { router } from "./";

import { authRouter } from "./modules/auth/auth.router";
import { userRouter } from "./modules/user/user.router";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
