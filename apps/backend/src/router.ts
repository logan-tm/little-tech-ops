import { router } from "./trpc";

import { usersRouter } from "./routers/users.routes";
import { authRouter } from "./routers/auth.routes";

export const appRouter = router({
  users: usersRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
