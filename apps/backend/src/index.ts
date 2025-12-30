import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./router";
import { createContext } from "./trpc";

process.on("uncaughtException", function (err) {
  console.log(err);
});

const app = express();
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
app.listen(4000);
