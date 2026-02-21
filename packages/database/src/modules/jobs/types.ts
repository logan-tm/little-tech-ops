import type { z } from "zod";

import type {
  insertJobSchema,
  selectJobSchema,
  updateJobSchema,
} from "./schema";

export type InsertJobInput = z.infer<typeof insertJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type SelectJobOutput = z.infer<typeof selectJobSchema>;
export type Job = SelectJobOutput;
