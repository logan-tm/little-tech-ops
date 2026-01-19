import type {
  User,
  UnsafeUser,
  InputUser,
  UpdateableUser,
} from "../database/types";

type VerifiedUserSession = {
  id: string;
  user: User;
  verified: true;
  expired: false;
};

type UserSession = {
  id: string | null;
  user: User | null;
  verified: boolean;
  expired: boolean;
};

export type {
  User,
  UnsafeUser,
  InputUser,
  UpdateableUser,
  VerifiedUserSession,
  UserSession,
};
