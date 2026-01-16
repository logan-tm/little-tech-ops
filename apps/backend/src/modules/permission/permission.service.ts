import type { User } from "../user/user.types";

const AVAILABLE_PERMISSIONS = [
  "GET:users",
  "CREATE:users",
  "GET:inventoryItems",
  "GET:vehicles",
] as const;
type PermissionsType = (typeof AVAILABLE_PERMISSIONS)[number];

const PERMISSIONS_MAP: { [K in PermissionsType]: Array<User["role"]> } = {
  "GET:users": ["manager", "admin"],
  "CREATE:users": ["admin"],
  "GET:inventoryItems": ["user", "manager"],
  "GET:vehicles": ["user", "manager"],
  // ...
};

export const permissionService = {
  getPermissionsByRole(role: User["role"]) {
    return Object.keys(PERMISSIONS_MAP).filter((key) => {
      PERMISSIONS_MAP[key as PermissionsType].includes(role);
    });
  },
  getRolesWithPermission(permission: PermissionsType) {
    return PERMISSIONS_MAP[permission];
  },
};
