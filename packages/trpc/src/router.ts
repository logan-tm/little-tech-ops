import { router } from "./";

import { userRouter } from "./modules/user/user.router";
import { authRouter } from "./modules/auth/auth.router";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
