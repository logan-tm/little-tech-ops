import { insertUserSchema } from '@packages/database/users';
import { z } from 'zod/v3';
import { router } from '../../index';

import { permissionedProcedure } from '../../procedures';

export const userRouter = router({
  list: permissionedProcedure(['LIST:users']).query(
    async ({ ctx }) => await ctx.services.userService.listUsers(),
  ),
  getById: permissionedProcedure(['GET:user'])
    .input(z.number())
    .query(
      async ({ ctx, input }) =>
        await ctx.services.userService.getUserById(input),
    ),
  create: permissionedProcedure(['CREATE:user'])
    .input(insertUserSchema.strict())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.userService.createUser(input),
    ),
  remove: permissionedProcedure(['DELETE:user'])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.userService.deleteUser(input),
    ),
  update: permissionedProcedure(['UPDATE:user'])
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        passwordHash: z.string().optional(),
        role: z.enum(['admin', 'manager', 'technician']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await ctx.services.userService.updateUser(id, updateData);
    }),
});
