const AVAILABLE_PERMISSIONS = [
  "GET:users",
  "CREATE:users",
  "GET:inventoryItems",
  "GET:vehicles",
] as const;
export type Permission = (typeof AVAILABLE_PERMISSIONS)[number];
