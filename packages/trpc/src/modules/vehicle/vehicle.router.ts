import {
  insertVehicleSchema,
  updateVehicleSchema,
} from "@packages/database/vehicles";
import * as z from "zod/v4-mini";

import { router } from "../../index";
import { permissionedProcedure } from "../../procedures";

export const vehicleRouter = router({
  getById: permissionedProcedure(["GET:vehicle"])
    .input(z.number())
    .query(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.getVehicleById(input),
    ),
  getByUser: permissionedProcedure(["GET:vehicle"])
    .input(z.number())
    .query(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.getVehicleByUser(input),
    ),
  list: permissionedProcedure(["LIST:vehicles"]).query(
    async ({ ctx }) => await ctx.services.vehiclesService.listVehicles(),
  ),
  create: permissionedProcedure(["CREATE:vehicle"])
    .input(insertVehicleSchema)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.createVehicle(input),
    ),
  remove: permissionedProcedure(["DELETE:vehicle"])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.deleteVehicle(input),
    ),
  update: permissionedProcedure(["UPDATE:vehicle"])
    .input(updateVehicleSchema.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await ctx.services.vehiclesService.updateVehicle(id, updateData);
    }),
  checkout: permissionedProcedure(["GET:vehicle"])
    .input(
      z.object({
        vehicleId: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.checkoutVehicle(
          input.vehicleId,
          input.userId,
        ),
    ),
  return: permissionedProcedure(["GET:vehicle"])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.vehiclesService.returnVehicle(input),
    ),
});
