// Inspired by ArjanCodes' specification for a Predicate system
// https://github.com/ArjanCodes/examples/blob/main/2026/spec

import type { User } from "@packages/database";
import { definePredicate } from "./lib/predicate";
import { type Permission, getPermissionsByRole } from "./permissions";

const defineUserPredicate = definePredicate<User>();

// export const isRole = defineUserPredicate(
//   (user: User, role: User["role"]) => user.role === role,
// );

export const hasPermission = defineUserPredicate(
  (user: User, permission: Permission) => {
    return getPermissionsByRole(user.role).includes(permission);
  },
);

// Helper function for common use case of checking permissions
export const hp = (permission: Permission) => hasPermission(permission).build();

export const rules = {
  canAccessVehicleList: hp("LIST:vehicles"), // rules.canAccessVehicleList(user) => true/false
};

export const canAccessVehicleListRule = hasPermission("LIST:vehicles").build();

// Re-export types and functions for easier access
export { type Permission, getPermissionsByRole };
