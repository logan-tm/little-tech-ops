import { z } from "zod/v3";
import { protectedProcedure, router } from "../trpc";

import "dotenv/config";
import { insertUserSchema } from "../db/schema";
import UsersController from "../controllers/users.controller";

export const usersRouter = router({
  list: protectedProcedure.query(async () => await UsersController.listUsers()),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => await UsersController.getUserById(input)),
  create: protectedProcedure
    .input(insertUserSchema.strict())
    .mutation(async ({ input }) => await UsersController.createUser(input)),
  remove: protectedProcedure
    .input(z.number())
    .mutation(async (opts) => await UsersController.deleteUser(opts.input)),
  update: protectedProcedure
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
      return await UsersController.updateUser(id, updateData);
    }),
});
