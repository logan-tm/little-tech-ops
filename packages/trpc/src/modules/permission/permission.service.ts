import type { User } from "../user/user.types";
import type { Permission } from "./permission.types";

const PERMISSIONS_MAP: { [K in Permission]: Array<User["role"]> } = {
  "GET:users": ["manager", "admin"],
  "CREATE:users": ["admin"],
  "GET:inventoryItems": ["user", "manager"],
  "GET:vehicles": ["user", "manager"],
  // ...
};

// Credit to reddit where it's due
// https://www.reddit.com/r/typescript/comments/n5138v/using_template_literals_for_indexing_object/#:~:text=This%20is%20so%20annoying%20that%20I%20wrote%20my%20own%20helper%20utility%20function
export const keys: <K extends string>(r: Record<K, any>) => K[] =
  Object.keys.bind(Object);

export const permissionService = {
  getPermissionsByRole(role: User["role"]) {
    return keys(PERMISSIONS_MAP).filter((key) => {
      PERMISSIONS_MAP[key].includes(role);
    });
  },
  getRolesWithPermission(permission: Permission) {
    return PERMISSIONS_MAP[permission];
  },
};
