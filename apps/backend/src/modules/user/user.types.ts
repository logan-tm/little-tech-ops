import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { usersTable } from "../../db/schema";

export type UnsafeUser = InferSelectModel<typeof usersTable>;
export type User = Omit<UnsafeUser, "passwordHash" | "createdAt" | "updatedAt">;
export type InputUser = Omit<
  InferInsertModel<typeof usersTable>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateableUser = Partial<InputUser>;
