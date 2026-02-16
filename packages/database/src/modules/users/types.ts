import type { z } from "zod";

import type {
  insertUserSchema,
  selectUnsafeUserSchema,
  selectUserSchema,
  updateUserSchema,
  userLoginSchema,
} from "./schema";

export type InsertUserInput = z.infer<typeof insertUserSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SelectUnsafeUserOutput = z.infer<typeof selectUnsafeUserSchema>;
export type SelectUserOutput = z.infer<typeof selectUserSchema>;
export type User = SelectUserOutput;
