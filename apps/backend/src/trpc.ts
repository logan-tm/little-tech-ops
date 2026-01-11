import { initTRPC } from "@trpc/server";
import Cookies from "cookies";
import * as trpcExpress from "@trpc/server/adapters/express";
import { redis } from "./cache/redis";
import UsersController from "./controllers/users.controller";
import { CacheController } from "./controllers/cache.controller";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  try {
    const cookies = new Cookies(req, res);
    const accessToken = cookies.get("accessToken");
    if (!accessToken) {
      console.log("NO ACCESS TOKEN");
      return { req, res };
    }

    const { verified, payload } =
      CacheController.verifyAccessToken(accessToken);
    if (!verified || !payload.id) {
      console.log("NO USER ID");
      return { req, res };
    }

    console.log("BEFORE REDIS");
    const session = await redis.get(`user_tokens:${payload.id}`);
    if (!session) {
      console.log("NO REDIS SESSION");
      return { req, res };
    }
    console.log("AFTER REDIS");

    // We don't want to ping the database every time we get a request
    // Verifying the access token (and the user data in it) will be enough
    // const user = await UsersController.getUserById(parseInt(payload.id));
    // if (!user) {
    //   console.log("NO USER IN DB");
    //   return { req, res };
    // }

    return { req, res, user: payload };
  } catch (error) {
    throw new Error(`Context creation failed: ${(error as Error).message}`);
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;
export type AuthenticatedContext = Context & {
  user: NonNullable<Context["user"]>;
};

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ ctx, next }) => {
  /**
   * 1. Get access token and verify it
   *    - if it doesn't exist, throw forbidden error
   *    - if it does exist but it's expired, attempt refresh
   *        - if refresh is successful, continue
   *        - if refresh fails, throw error (no available session) (tells user to log in again)
   *    - if user is found in cache, use it and finish
   *    - if user is not in cache, pull from db
   *    - if user exists in db, cache it and continue
   *    - if user doesn't exist, throw error and invalidate all sessions in cache
   */
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(isAuthenticated);
