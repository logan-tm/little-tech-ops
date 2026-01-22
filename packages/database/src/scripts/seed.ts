import "dotenv/config";

import bcrypt from "bcryptjs";
import { userService } from "../modules/users/service";

// Seed an admin user for testing
async function seed() {
  const passwordHash = bcrypt.hashSync("admin12345", 10);

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
