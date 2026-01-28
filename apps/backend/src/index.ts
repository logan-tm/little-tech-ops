import "dotenv/config";

import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc";
import { env } from "./env";

process.on("uncaughtException", function (err) {
  console.log(err);
});

const app = express();
app.use(cors({ credentials: true }));
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);
app.listen(env.PORT);
