import { z } from "zod/v3";
import { publicProcedure, router } from "../trpc";

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { usersTable, insertUserSchema } from "../db/schema";
import UsersController from "../controllers/users.controller";

const db = drizzle(process.env.DB_FILE_NAME!);

export const usersRouter = router({
  list: publicProcedure.query(async () => await db.select().from(usersTable)),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => await UsersController.getUserById(input)),
  create: publicProcedure
    .input(insertUserSchema.strict())
    .mutation(async ({ input }) => await UsersController.createUser(input)),
  remove: publicProcedure
    .input(z.number())
    .mutation(async (opts) =>
      db.delete(usersTable).where(eq(usersTable.id, opts.input))
    ),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        passwordHash: z.string().optional(),
        role: z.enum(["admin", "manager", "user"]).optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, ...updateData } = opts.input;
      return await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, id));
    }),
});
