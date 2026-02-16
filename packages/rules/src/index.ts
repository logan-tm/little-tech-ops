// Inspired by ArjanCodes' specification for a Predicate system
// https://github.com/ArjanCodes/examples/blob/main/2026/spec

import type { User } from "@packages/database/users";

import { definePredicate } from "./lib/predicate";
import type { Permission } from "./permissions";
import { getPermissionsByRole } from "./permissions";

// We can build some pretty elaborate rules with this system, but for now
// we'll just check if a user has a specific permission.

// Is it overkill? Yes.
const defineUserPredicate = definePredicate<User>();

export const hasPermission = defineUserPredicate(
  (user: User, permission: Permission) => {
    return getPermissionsByRole(user.role).includes(permission);
  },
);

export const hasAllPermissions = defineUserPredicate(
  (user: User, permissions: Permission[]) => {
    const userPermissions = getPermissionsByRole(user.role);
    return permissions.every((permission) =>
      userPermissions.includes(permission),
    );
  },
);

// Helper function for common use case of checking permissions
const hp = (permission: Permission) => hasPermission(permission).build();

export const rules = {
  canAccessVehicleList: hp("LIST:vehicles"), // rules.canAccessVehicleList(user) => true/false
};

// Re-export types and functions for easier access
export * from "./permissions";
