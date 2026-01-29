import type { User } from "@packages/database/types";
import { type Permission, getPermissionsByRole } from "./permissions";
import { defineRule } from "./rules";

const hasPermission = defineRule<User>((user: User, permission: Permission) => {
  return getPermissionsByRole(user.role).includes(permission);
});

// usage: shouldBeLetThrough = canSeeJobsPage(user);
export const canSeeJobsPage = hasPermission("LIST:jobs:all")
  .or(hasPermission("LIST:jobs:assigned"))
  .build();
export const canSeeVehiclesPage = hasPermission("LIST:vehicles").build();
export const canSeeUsersPage = hasPermission("LIST:users").build();

// re-export anything for client convenience
export { getPermissionsByRole };
