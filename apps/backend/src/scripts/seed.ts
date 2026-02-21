import { createPgDatabaseServices } from "@packages/database";

import { env } from "../env";

async function seed() {
  const { userService, jobsService, vehiclesService } =
    await createPgDatabaseServices(env.DATABASE_URL);

  // ── Users ──────────────────────────────────────────────────────────
  console.log("Seeding users...");

  const admin = await userService.createUser({
    firstName: "Super",
    lastName: "Admin",
    email: "super@admin.com",
    password: "password123",
    role: "admin",
  });

  const sarah = await userService.createUser({
    firstName: "Sarah",
    lastName: "Manager",
    email: "sarah@manager.com",
    password: "password123",
    role: "manager",
  });

  const mike = await userService.createUser({
    firstName: "Mike",
    lastName: "Manager",
    email: "mike@manager.com",
    password: "password123",
    role: "manager",
  });

  const jake = await userService.createUser({
    firstName: "Jake",
    lastName: "Tech",
    email: "jake@tech.com",
    password: "password123",
    role: "technician",
  });

  const lisa = await userService.createUser({
    firstName: "Lisa",
    lastName: "Tech",
    email: "lisa@tech.com",
    password: "password123",
    role: "technician",
  });

  if (!admin || !sarah || !mike || !jake || !lisa) {
    throw new Error("Failed to create one or more users");
  }

  console.log(
    `  Created ${[admin, sarah, mike, jake, lisa].length} users: admin, 2 managers, 2 technicians`,
  );

  // ── Vehicles ───────────────────────────────────────────────────────
  console.log("Seeding vehicles...");

  const f150 = await vehiclesService.createVehicle({
    make: "Ford",
    model: "F-150",
    year: 2023,
    vin: "1FTFW1E80PFA00001",
  });

  const silverado = await vehiclesService.createVehicle({
    make: "Chevrolet",
    model: "Silverado",
    year: 2022,
    vin: "1GCUYEED0NZ100002",
  });

  const tacoma = await vehiclesService.createVehicle({
    make: "Toyota",
    model: "Tacoma",
    year: 2024,
    vin: "3TMCZ5AN0RM200003",
  });

  const ram = await vehiclesService.createVehicle({
    make: "Ram",
    model: "1500",
    year: 2023,
    vin: "1C6SRFFT0PN300004",
  });

  if (!f150 || !silverado || !tacoma || !ram) {
    throw new Error("Failed to create one or more vehicles");
  }

  // Check out the Tacoma to Jake
  await vehiclesService.checkoutVehicle(tacoma.id, jake.id);

  // Put the Ram in maintenance
  await vehiclesService.updateVehicle(ram.id, { status: "maintenance" });

  console.log(
    `  Created ${[f150, silverado, tacoma, ram].length} vehicles: 2 available, 1 in_use (Jake), 1 maintenance`,
  );

  // ── Jobs ───────────────────────────────────────────────────────────
  console.log("Seeding jobs...");

  const job1 = await jobsService.createJob({
    title: "TV Wall Mount - 742 Evergreen Terrace",
    description:
      "Install 65\" Samsung TV with full-motion wall mount in living room. Customer providing the TV, we supply the mount and hardware.",
    status: "pending",
    createdBy: sarah.id,
  });

  const job2 = await jobsService.createJob({
    title: "Home Theater Setup - 1600 Pennsylvania Ave",
    description:
      "Full 5.1 surround sound installation and calibration. Run speaker wire through walls, mount rear speakers, and configure receiver.",
    status: "in_progress",
    assignedTo: jake.id,
    createdBy: sarah.id,
  });

  const job3 = await jobsService.createJob({
    title: "Security Camera Install - 221B Baker St",
    description:
      "Install 4-camera outdoor security system with DVR. Mount cameras at front door, back door, garage, and driveway. Run cabling and configure mobile app.",
    status: "pending",
    assignedTo: lisa.id,
    createdBy: mike.id,
  });

  const job4 = await jobsService.createJob({
    title: "Smart Thermostat Install - 12 Grimmauld Pl",
    description:
      "Replace existing thermostat with Nest Learning Thermostat. Verify HVAC compatibility, install, and walk customer through app setup.",
    status: "completed",
    assignedTo: jake.id,
    createdBy: sarah.id,
  });

  const job5 = await jobsService.createJob({
    title: "Network Setup - 350 Fifth Ave",
    description:
      "Set up mesh Wi-Fi system across 3-story townhome. Install 3 access points, configure network, and test coverage on all floors.",
    status: "pending",
    createdBy: mike.id,
  });

  const job6 = await jobsService.createJob({
    title: "Projector Install - 90210 Sunset Blvd",
    description:
      "Ceiling-mount projector installation in dedicated media room. Install 120\" motorized screen, run HDMI through ceiling, and calibrate picture.",
    status: "in_progress",
    assignedTo: lisa.id,
    createdBy: mike.id,
  });

  if (!job1 || !job2 || !job3 || !job4 || !job5 || !job6) {
    throw new Error("Failed to create one or more jobs");
  }

  console.log(
    `  Created ${[job1, job2, job3, job4, job5, job6].length} jobs: 3 pending, 2 in_progress, 1 completed`,
  );

  // ── Done ───────────────────────────────────────────────────────────
  console.log("DB seeding successful!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
