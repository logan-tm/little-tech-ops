import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

// ======================================================
// Users Table

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  firstName: text().notNull(),
  lastName: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  role: text({ enum: ["admin", "manager", "user"] })
    .notNull()
    .default("user"),
  createdAt: text().notNull().default(new Date().toISOString()),
  updatedAt: text()
    .notNull()
    .default(new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ======================================================
// Transactions Table

export const transactionsTable = sqliteTable("transactions_table", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const insertTransactionSchema = createInsertSchema(
  transactionsTable
).omit({
  id: true,
  userId: true,
});

// ======================================================
// Relationships

export const userRelations = relations(usersTable, ({ many }) => ({
  transactions: many(transactionsTable),
}));

export const transactionRelations = relations(transactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [transactionsTable.userId],
    references: [usersTable.id],
  }),
}));
