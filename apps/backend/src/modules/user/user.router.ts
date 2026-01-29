import { z } from "zod/v3";
import { userService, insertUserSchema } from "@packages/database";
import { router } from "../../trpc/init";
import { procedurePermittedBy } from "../../trpc/procedures";

export const userRouter = router({
  list: procedurePermittedBy("LIST:users").query(
    async () => await userService.listUsers(),
  ),
  getById: procedurePermittedBy("GET:user")
    .input(z.number())
    .query(async ({ input }) => await userService.getUserById(input)),
  create: procedurePermittedBy("CREATE:user")
    .input(insertUserSchema.strict())
    .mutation(async ({ input }) => await userService.createUser(input)),
  remove: procedurePermittedBy("DELETE:user")
    .input(z.number())
    .mutation(async (opts) => await userService.deleteUser(opts.input)),
  update: procedurePermittedBy("UPDATE:user")
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        passwordHash: z.string().optional(),
        role: z.enum(["admin", "manager", "technician"]).optional(),
      }),
    )
    .mutation(async (opts) => {
      const { id, ...updateData } = opts.input;
      return await userService.updateUser(id, updateData);
    }),
});
