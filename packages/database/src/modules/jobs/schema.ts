import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { usersTable } from "../users/schema";

export const jobsTable = pgTable("jobs_table", {
  id: bigint("id", { mode: "number" })
    .generatedAlwaysAsIdentity()
    .primaryKey()
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text({ enum: ["pending", "in_progress", "completed", "cancelled"] })
    .default("pending")
    .notNull(),
  assignedTo: bigint("assignedTo", { mode: "number" }).references(
    () => usersTable.id,
  ),
  createdBy: bigint("createdBy", { mode: "number" })
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateJobSchema = insertJobSchema.partial();

export const selectJobSchema = createSelectSchema(jobsTable);
