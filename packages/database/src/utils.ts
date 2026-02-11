import { randomUUID } from "node:crypto";

export const createId = () => {
  return randomUUID();
};
