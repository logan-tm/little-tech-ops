import { createDatabaseClient, createDrizzle } from "./root";
import { UserService } from "./modules/users/service";

export async function createDatabaseServices(url: string) {
  const client = await createDatabaseClient(url);
  const db = createDrizzle(client);

  const userService = new UserService(db);

  return {
    userService,
  };
}

export type { UserService };
