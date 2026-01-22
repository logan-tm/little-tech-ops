import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  firstName: text().notNull(),
  lastName: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: text({ enum: ["admin", "manager", "technician"] })
    .notNull()
    .default("technician"),
  createdAt: text().notNull().default(new Date().toISOString()),
  updatedAt: text()
    .notNull()
    .default(new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(usersTable, {
  password: (schema) =>
    schema.min(8, { error: "Password must be at least 8 characters long" }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserInput = z.infer<typeof insertUserSchema>;

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});
export type UserLoginInput = z.infer<typeof userLoginSchema>;

export const updateUserSchema = insertUserSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const selectUnsafeUserSchema = createSelectSchema(usersTable);
export type SelectUnsafeUserOutput = z.infer<typeof selectUnsafeUserSchema>;

export const selectUserSchema = selectUnsafeUserSchema.omit({
  password: true,
  createdAt: true,
  updatedAt: true,
});
export type SelectUserOutput = z.infer<typeof selectUserSchema>;
export type User = SelectUserOutput;
