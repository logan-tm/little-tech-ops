import { authRouter } from "./modules/auth/auth.router";
import { jobRouter } from "./modules/job/job.router";
import { userRouter } from "./modules/user/user.router";
import { vehicleRouter } from "./modules/vehicle/vehicle.router";

import { router } from "./";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
  jobs: jobRouter,
  vehicles: vehicleRouter,
});

export type AppRouter = typeof appRouter;
