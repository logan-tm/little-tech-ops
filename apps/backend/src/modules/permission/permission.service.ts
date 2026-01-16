import type { User } from "../user/user.types";

const PERMISSIONS: {
  [key: string]: Array<User["role"]>;
} = {
  "GET:users": ["admin"],
  "GET:inventoryItems": ["user", "admin"],
  // ...
};
type Permission = keyof typeof PERMISSIONS;

export const permissionService = {
  getPermissionsByRole(role: User["role"]) {
    return Object.keys(PERMISSIONS).filter((key: string) => {
      PERMISSIONS[key as Permission].includes(role);
    });
  },
  getRolesWithPermission(permission: Permission) {
    return PERMISSIONS[permission];
  },
};
