import {
  bigint,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users_table", {
  id: bigint("id", { mode: "number" })
    .generatedAlwaysAsIdentity()
    .primaryKey()
    .notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text({ enum: ["admin", "manager", "technician"] })
    .default("technician")
    .notNull(),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable, {
  password: schema =>
    schema.min(8, { error: "Password must be at least 8 characters long" }),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const updateUserSchema = insertUserSchema.partial();

export const selectUnsafeUserSchema = createSelectSchema(usersTable);

export const selectUserSchema = selectUnsafeUserSchema.omit({
  password: true,
  createdAt: true,
  updatedAt: true,
});
