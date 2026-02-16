import { authRouter } from "./modules/auth/auth.router";
import { userRouter } from "./modules/user/user.router";

import { router } from "./";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
