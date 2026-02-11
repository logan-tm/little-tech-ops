import * as trpcExpress from "@trpc/server/adapters/express";

import type { CacheService } from "@packages/cache";
import type { UserService } from "@packages/database";

import type { CookieService } from "./modules/cookie/cookie.service";
import type { AuthService } from "./modules/auth/auth.service";

import { VerifiedUserSession } from "./modules/auth/auth.types";

export const createContextWrapper = (services: {
  authService: AuthService;
  cacheService: CacheService;
  userService: UserService;
  cookieService: CookieService;
}) => {
  return async (opts: trpcExpress.CreateExpressContextOptions) => {
    const { authService, cacheService, userService, cookieService } = services;
    const context = await createContext({
      ...opts,
      services: { authService, cacheService, cookieService, userService },
    });
    return {
      ...context,
      services: { authService, cacheService, cookieService, userService },
    };
  };
};

type ContextOptions = trpcExpress.CreateExpressContextOptions & {
  services: {
    authService: AuthService;
    cacheService: CacheService;
    cookieService: CookieService;
    userService: UserService;
  };
};

const createContext = async ({ req, res, info, services }: ContextOptions) => {
  return { req, res, info, services };
};

export type Context = Awaited<
  ReturnType<ReturnType<typeof createContextWrapper>>
>;

export type AuthenticatedContext = Context & {
  session: VerifiedUserSession;
};
