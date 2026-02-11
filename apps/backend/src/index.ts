import "dotenv/config";

import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { appRouter } from "./trpc/router";
import { createContextWrapper } from "./trpc/context";
import { env } from "./env";

import { createDatabaseServices } from "@packages/database";
import { createCacheService } from "@packages/cache";

process.on("uncaughtException", function (err) {
  console.log(err);
});

// const db = createDbConnection(env.DATABASE_URL);
const cacheService = createCacheService(env.REDIS_URL, {
  accessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
  refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
});

const { userService } = await createDatabaseServices(env.DATABASE_URL);

const app = express();
app.use(cors({ credentials: true }));
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createContextWrapper({
      cacheService,
      userService,
    }),
  }),
);
app.listen(env.PORT);
