import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { usersTable } from "../users/schema";

export const vehiclesTable = pgTable("vehicles_table", {
  id: bigint("id", { mode: "number" })
    .generatedAlwaysAsIdentity()
    .primaryKey()
    .notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").unique().notNull(),
  status: text({ enum: ["available", "in_use", "maintenance"] })
    .default("available")
    .notNull(),
  checkedOutBy: bigint("checkedOutBy", { mode: "number" })
    .references(() => usersTable.id)
    .unique(),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateVehicleSchema = insertVehicleSchema.partial();

export const selectVehicleSchema = createSelectSchema(vehiclesTable);
