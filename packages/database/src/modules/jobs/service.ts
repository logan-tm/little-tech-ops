import { eq } from "drizzle-orm";

import type { DBType } from "../../root";

import { jobsTable } from "./schema";
import type { InsertJobInput, Job, UpdateJobInput } from "./types";

export class JobsService {
  constructor(private db: DBType) {}

  async getJobById(jobId: number): Promise<Job | null> {
    const [job] = await this.db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .limit(1);

    return job ?? null;
  }

  async listJobs(): Promise<Job[]> {
    return await this.db.select().from(jobsTable);
  }

  async listJobsByAssignee(userId: number): Promise<Job[]> {
    return await this.db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.assignedTo, userId));
  }

  async createJob(input: InsertJobInput): Promise<Job | null> {
    const [job] = await this.db
      .insert(jobsTable)
      .values(input)
      .returning();

    return job ?? null;
  }

  async updateJob(id: number, input: UpdateJobInput): Promise<Job | null> {
    const [job] = await this.db
      .update(jobsTable)
      .set(input)
      .where(eq(jobsTable.id, id))
      .returning();

    return job ?? null;
  }

  async deleteJob(jobId: number) {
    return await this.db
      .delete(jobsTable)
      .where(eq(jobsTable.id, jobId));
  }

  async assignJob(jobId: number, userId: number): Promise<Job | null> {
    const [job] = await this.db
      .update(jobsTable)
      .set({ assignedTo: userId })
      .where(eq(jobsTable.id, jobId))
      .returning();

    return job ?? null;
  }

  async unassignJob(jobId: number): Promise<Job | null> {
    const [job] = await this.db
      .update(jobsTable)
      .set({ assignedTo: null })
      .where(eq(jobsTable.id, jobId))
      .returning();

    return job ?? null;
  }
}
