import { insertUserSchema, updateUserSchema } from "@packages/database/users";
import * as z from "zod/v4-mini";

import { router } from "../../index";
import { permissionedProcedure } from "../../procedures";

export const userRouter = router({
  list: permissionedProcedure(["LIST:users"]).query(
    async ({ ctx }) => await ctx.services.userService.listUsers(),
  ),
  getById: permissionedProcedure(["GET:user"])
    .input(z.number())
    .query(
      async ({ ctx, input }) =>
        await ctx.services.userService.getUserById(input),
    ),
  create: permissionedProcedure(["CREATE:user"])
    .input(insertUserSchema.strict())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.userService.createUser(input),
    ),
  remove: permissionedProcedure(["DELETE:user"])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.userService.deleteUser(input),
    ),
  update: permissionedProcedure(["UPDATE:user"])
    .input(
      updateUserSchema.extend({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await ctx.services.userService.updateUser(id, updateData);
    }),
});
