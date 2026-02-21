import type { z } from "zod";

import type {
  insertVehicleSchema,
  selectVehicleSchema,
  updateVehicleSchema,
} from "./schema";

export type InsertVehicleInput = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SelectVehicleOutput = z.infer<typeof selectVehicleSchema>;
export type Vehicle = SelectVehicleOutput;
