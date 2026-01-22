import type { User } from '@packages/database/types';

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

export type * from '@packages/database';
