import { z } from "zod/v3";
import { userService } from "@packages/database";
import { protectedProcedure, router } from "../../trpc";

import { insertUserSchema } from "../../db/schema";
// import { userService } from "./user.service";

export const userRouter = router({
  list: protectedProcedure.query(async () => await userService.listUsers()),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => await userService.getUserById(input)),
  create: protectedProcedure
    .input(insertUserSchema.strict())
    .mutation(async ({ input }) => await userService.createUser(input)),
  remove: protectedProcedure
    .input(z.number())
    .mutation(async (opts) => await userService.deleteUser(opts.input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        passwordHash: z.string().optional(),
        role: z.enum(["admin", "manager", "user"]).optional(),
      }),
    )
    .mutation(async (opts) => {
      const { id, ...updateData } = opts.input;
      return await userService.updateUser(id, updateData);
    }),
});
