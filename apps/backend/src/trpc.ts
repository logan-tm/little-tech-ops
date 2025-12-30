import { initTRPC } from "@trpc/server";
import Cookies from "cookies";
import * as trpcExpress from "@trpc/server/adapters/express";
import AuthController from "./controllers/auth.controller";
import { redis } from "./cache/redis";
import UsersController from "./controllers/users.controller";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  try {
    const cookies = new Cookies(req, res);
    const accessToken = cookies.get("accessToken");
    if (!accessToken) {
      return { req, res };
    }

    const userId = AuthController.verifyAccessToken(accessToken);
    if (!userId) {
      return { req, res };
    }

    const session = await redis.get(`user:${userId}`);
    if (!session) {
      return { req, res };
    }

    const user = await UsersController.getUserById(userId);
    if (!user) {
      return { req, res };
    }

    return { req, res, user };
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
