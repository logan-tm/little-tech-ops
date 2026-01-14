import { User } from "../user/user.types";

export type JWTPayload = {
  user: User;
  sessionId: string;
};

type JWTVerifyBadResult = {
  verified: false;
  expired: boolean;
  payload: null;
};

type JWTVerifyGoodResult = {
  verified: true;
  expired: false;
  payload: JWTPayload;
};

export type JWTVerifyResult = JWTVerifyGoodResult | JWTVerifyBadResult;

export type RefreshTokenData = {
  userId: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
};
