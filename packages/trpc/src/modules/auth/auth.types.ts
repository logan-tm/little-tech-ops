import type { User } from "@packages/database/users";

export interface VerifiedUserSession {
  id: string;
  user: User;
  verified: true;
  expired: false;
}

export interface UserSession {
  id: string | null;
  user: User | null;
  verified: boolean;
  expired: boolean;
}
