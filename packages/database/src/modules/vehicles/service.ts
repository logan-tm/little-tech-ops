import { eq } from "drizzle-orm";

import type { DBType } from "../../root";

import { vehiclesTable } from "./schema";
import type { InsertVehicleInput, UpdateVehicleInput, Vehicle } from "./types";

export class VehiclesService {
  constructor(private db: DBType) {}

  async getVehicleById(vehicleId: number): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, vehicleId))
      .limit(1);

    return vehicle ?? null;
  }

  async getVehicleByUser(userId: number): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.checkedOutBy, userId))
      .limit(1);

    return vehicle ?? null;
  }

  async listVehicles(): Promise<Vehicle[]> {
    return await this.db.select().from(vehiclesTable);
  }

  async createVehicle(input: InsertVehicleInput): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .insert(vehiclesTable)
      .values(input)
      .returning();

    return vehicle ?? null;
  }

  async updateVehicle(
    id: number,
    input: UpdateVehicleInput,
  ): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .update(vehiclesTable)
      .set(input)
      .where(eq(vehiclesTable.id, id))
      .returning();

    return vehicle ?? null;
  }

  async deleteVehicle(vehicleId: number) {
    return await this.db
      .delete(vehiclesTable)
      .where(eq(vehiclesTable.id, vehicleId));
  }

  async checkoutVehicle(
    vehicleId: number,
    userId: number,
  ): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .update(vehiclesTable)
      .set({ checkedOutBy: userId, status: "in_use" })
      .where(eq(vehiclesTable.id, vehicleId))
      .returning();

    return vehicle ?? null;
  }

  async returnVehicle(vehicleId: number): Promise<Vehicle | null> {
    const [vehicle] = await this.db
      .update(vehiclesTable)
      .set({ checkedOutBy: null, status: "available" })
      .where(eq(vehiclesTable.id, vehicleId))
      .returning();

    return vehicle ?? null;
  }
}
