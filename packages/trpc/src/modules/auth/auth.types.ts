import type { User } from "@packages/database/users";

export type VerifiedUserSession = {
  id: string;
  user: User;
  verified: true;
  expired: false;
};

export type UserSession = {
  id: string | null;
  user: User | null;
  verified: boolean;
  expired: boolean;
};
