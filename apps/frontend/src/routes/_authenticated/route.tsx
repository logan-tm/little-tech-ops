import type { Job } from "@packages/database/jobs";
import type { User } from "@packages/database/users";
import type { Vehicle } from "@packages/database/vehicles";
import type { Permission } from "@packages/rules";
import type { VerifiedUserSession } from "@packages/trpc";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod/v4-mini";

interface UserData {
  assignedJobs: Array<Job> | null;
  allJobs: Array<Job> | null;
  vehicles: Array<Vehicle> | null;
  users: Array<User> | null;
}

export const Route = createFileRoute("/_authenticated")({
  validateSearch: z.object({
    redirect: z.optional(z.catch(z.string(), "")),
  }),
  beforeLoad: async ({
    context: { isAuthenticated, session, permissions, trpcUtils },
    location,
  }): Promise<{
    session: VerifiedUserSession;
    permissions: Array<Permission>;
    userData: UserData;
  }> => {
    if (!isAuthenticated || !session || !session.user || !permissions) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    const userData = {
      assignedJobs: permissions.includes("LIST:jobs:assigned")
        ? await trpcUtils.jobs.listAssigned.ensureData()
        : null,
      allJobs: permissions.includes("LIST:jobs:all")
        ? await trpcUtils.jobs.list.ensureData()
        : null,
      vehicles: permissions.includes("LIST:vehicles")
        ? await trpcUtils.vehicles.list.ensureData()
        : null,
      users: permissions.includes("LIST:users")
        ? await trpcUtils.users.list.ensureData()
        : null,
    };
    return {
      session: session as VerifiedUserSession,
      permissions,
      userData,
    };
  },
  component: () => <Outlet />,
});
