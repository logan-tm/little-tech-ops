import type { CacheService } from "@packages/cache";
import type { UserService } from "@packages/database";
// This import breaks builds currently. Recreating myself with express and the TRPCInfo interface below
// import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";

import type { AuthService } from "./modules/auth/auth.service";
import type { VerifiedUserSession } from "./modules/auth/auth.types";
import type { CookieService } from "./modules/cookie/cookie.service";

// recreates as needed: @trpc/server/unstable-core-do-not-import/http/types.ts -> TRPCRequestInfo
export interface TRPCInfo {
  url: URL | null;
  // ...
}

export interface ExpressContextOpts {
  req: Request;
  res: Response;
  info: TRPCInfo;
}

export function createContextWrapper(services: {
  authService: AuthService;
  cacheService: CacheService;
  userService: UserService;
  cookieService: CookieService;
}) {
  // return async (opts: CreateExpressContextOptions) => {
  return async (opts: { req: Request; res: Response; info: TRPCInfo }) => {
    return {
      ...opts,
      services,
    };
  };
}

export type Context = Awaited<
  ReturnType<ReturnType<typeof createContextWrapper>>
>;

export type AuthenticatedContext = Context & {
  session: VerifiedUserSession;
};
