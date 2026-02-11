import "dotenv/config";

import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { env } from "./env";

import {
  appRouter,
  createContextWrapper,
  AuthService,
  CookieService,
} from "@packages/trpc";
import { createDatabaseServices } from "@packages/database";
import { createCacheService } from "@packages/cache";

process.on("uncaughtException", function (err) {
  console.log("UNCAUGHT: " + err);
});

async function main() {
  const cacheService = createCacheService(env.REDIS_URL, {
    accessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
  });

  const { userService } = await createDatabaseServices(env.DATABASE_URL);

  const cookieService = new CookieService();

  const authService = new AuthService(cacheService, cookieService, userService);

  const app = express();
  app.use(cors({ credentials: true }));
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createContextWrapper({
        authService,
        cookieService,
        cacheService,
        userService,
      }),
    }),
  );
  app.listen(env.PORT);
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
