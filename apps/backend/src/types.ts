/**
 * session: {
      id: payload?.sessionId,
      user: payload?.user,
      verified,
      expired,
    },
 */

import type { User } from "./controllers/users.controller";

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
