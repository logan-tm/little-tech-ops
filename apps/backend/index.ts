// https://trpc.io/docs/quickstart

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod/v3";
import { db } from "./db";
import { publicProcedure, router } from "./trpc";

const appRouter = router({
  userList: publicProcedure.query(async () => {
    const users = await db.user.findMany();
    return users;
  }),
  userById: publicProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    const user = await db.user.findById(input);
    return user;
  }),
  userCreate: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (opts) => {
      console.log("Creating user...");
      const { input } = opts;
      const user = await db.user.create(input);
      return user;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(5000);
