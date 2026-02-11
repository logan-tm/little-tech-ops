import type { User } from '@packages/database/users';

export interface JWTPayload {
  user: User;
  sessionId: string;
}

interface JWTVerifyBadResult {
  verified: false;
  expired: boolean;
  payload: null;
}

interface JWTVerifyGoodResult {
  verified: true;
  expired: false;
  payload: JWTPayload;
}

export type JWTVerifyResult = JWTVerifyGoodResult | JWTVerifyBadResult;

export interface RefreshTokenData {
  userId: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}
