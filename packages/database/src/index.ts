import { JobsService } from "./modules/jobs/service";
import { UserService } from "./modules/users/service";
import { VehiclesService } from "./modules/vehicles/service";
import { createDatabaseClient, createDrizzle } from "./root";

export async function createPgDatabaseServices(url: string) {
  const client = await createDatabaseClient(url);
  const db = createDrizzle(client);

  const userService = new UserService(db);
  const jobsService = new JobsService(db);
  const vehiclesService = new VehiclesService(db);

  return {
    userService,
    jobsService,
    vehiclesService,
  };
}

export type { JobsService, UserService, VehiclesService };
