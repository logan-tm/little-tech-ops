import type { User } from "@packages/database/users";

const _AVAILABLE_PERMISSIONS = [
  "GET:user",
  "LIST:users",
  "CREATE:user",
  "DELETE:user",
  "UPDATE:user",
  //
  "GET:vehicle",
  "LIST:vehicles",
  "CREATE:vehicle",
  "DELETE:vehicle",
  "UPDATE:vehicle",
  //
  "GET:job",
  "LIST:jobs:all",
  "LIST:jobs:assigned",
  "CREATE:job",
  "DELETE:job",
  "UPDATE:job",
  "ASSIGN:job",
  "WORK:job",
] as const;
export type Permission = (typeof _AVAILABLE_PERMISSIONS)[number];

const PERMISSIONS_MAP: { [K in Permission]: Array<User["role"]> } = {
  "GET:user": ["manager", "admin"],
  "LIST:users": ["manager", "admin"],
  "CREATE:user": ["admin"],
  "DELETE:user": ["admin"],
  "UPDATE:user": ["manager", "admin"],
  //
  "GET:vehicle": ["technician", "manager"],
  "LIST:vehicles": ["technician", "manager"],
  "CREATE:vehicle": ["manager"],
  "DELETE:vehicle": ["manager"],
  "UPDATE:vehicle": ["manager"],
  //
  "GET:job": ["technician", "manager"],
  "LIST:jobs:all": ["manager"],
  "LIST:jobs:assigned": ["technician", "manager"],
  "CREATE:job": ["manager"],
  "DELETE:job": ["manager"],
  "UPDATE:job": ["manager"],
  "ASSIGN:job": ["manager"],
  "WORK:job": ["technician", "manager"],
};

// Credit to reddit where it's due
// https://www.reddit.com/r/typescript/comments/n5138v/using_template_literals_for_indexing_object/#:~:text=This%20is%20so%20annoying%20that%20I%20wrote%20my%20own%20helper%20utility%20function
export const keys: <K extends string>(r: Record<K, any>) => K[] =
  Object.keys.bind(Object);

export function getPermissionsByRole(role: User["role"]) {
  return keys(PERMISSIONS_MAP).filter((key) => {
    return PERMISSIONS_MAP[key].includes(role);
  });
}

export function getRolesWithPermission(permission: Permission) {
  return PERMISSIONS_MAP[permission];
}
