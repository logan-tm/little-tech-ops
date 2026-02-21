import { insertJobSchema } from "@packages/database/jobs";
import { z } from "zod/v3";

import { router } from "../../index";
import { permissionedProcedure } from "../../procedures";

export const jobRouter = router({
  getById: permissionedProcedure(["GET:job"])
    .input(z.number())
    .query(
      async ({ ctx, input }) =>
        await ctx.services.jobsService.getJobById(input),
    ),
  list: permissionedProcedure(["LIST:jobs:all"]).query(
    async ({ ctx }) => await ctx.services.jobsService.listJobs(),
  ),
  listAssigned: permissionedProcedure(["LIST:jobs:assigned"]).query(
    async ({ ctx }) =>
      await ctx.services.jobsService.listJobsByAssignee(ctx.session.user.id),
  ),
  create: permissionedProcedure(["CREATE:job"])
    .input(insertJobSchema)
    .mutation(
      async ({ ctx, input }) => await ctx.services.jobsService.createJob(input),
    ),
  remove: permissionedProcedure(["DELETE:job"])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) => await ctx.services.jobsService.deleteJob(input),
    ),
  update: permissionedProcedure(["UPDATE:job"])
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
        assignedTo: z.number().nullable().optional(),
        createdBy: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await ctx.services.jobsService.updateJob(id, updateData);
    }),
  assign: permissionedProcedure(["ASSIGN:job"])
    .input(
      z.object({
        jobId: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.jobsService.assignJob(input.jobId, input.userId),
    ),
  unassign: permissionedProcedure(["ASSIGN:job"])
    .input(z.number())
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.jobsService.unassignJob(input),
    ),
  work: permissionedProcedure(["WORK:job"])
    .input(
      z.object({
        jobId: z.number(),
        status: z.enum(["in_progress", "completed", "cancelled"]),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.services.jobsService.updateJob(input.jobId, {
          status: input.status,
        }),
    ),
});
