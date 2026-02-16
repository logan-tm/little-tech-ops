import { createPgDatabaseServices } from "@packages/database";
import bcrypt from "bcryptjs";

import { env } from "../env";

// Seed an admin user for testing
async function seed() {
  const passwordHash = bcrypt.hashSync("admin12345", 10);

  const { userService } = await createPgDatabaseServices(env.DATABASE_URL);

  await userService.createUser({
    firstName: "Super",
    lastName: "Admin",
    email: "super@admin.com",
    password: passwordHash,
    role: "admin",
  });

  console.log("DB seeding successful!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
