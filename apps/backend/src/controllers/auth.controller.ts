import Cookies, { type SetOption } from "cookies";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { redis } from "../cache/redis";
import { usersTable } from "../db/schema";
import type { Context } from "../trpc";

const db = drizzle(process.env.DB_FILE_NAME!);

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const accessTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default class AuthController {
  static async login(input: { email: string; password: string }, ctx: Context) {
    try {
      const { email, password } = input;
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .get();

      if (!user) {
        throw new Error("Invalid email or password.");
      }

      // Here you would normally verify the password hash
      if (!bcrypt.compareSync(password, user.passwordHash)) {
        throw new Error("Invalid email or password");
      }

      const accessToken = this.createAccessToken(user.id);

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET!
      );

      await redis.set(
        `refresh_token:${refreshToken}`,
        user.id,
        "EX",
        7 * 24 * 60 * 60 // 7 days
      );

      await redis.sadd(`refresh_tokens:${user.id}`, refreshToken);
      await redis.expire(`refresh_tokens:${user.id}`, 7 * 24 * 60 * 60); // 7 days

      await redis.set(
        `user:${user.id}`,
        JSON.stringify(user),
        "EX",
        7 * 24 * 60 * 60
      ); // 7 days

      const cookies = new Cookies(ctx.req, ctx.res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", accessToken, {
        ...accessTokenCookieOptions,
      });
      cookies.set("refreshToken", refreshToken, {
        ...refreshTokenCookieOptions,
      });
      cookies.set("loggedIn", "true", { ...accessTokenCookieOptions });

      return { message: "Login successful" };
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  static async logout(ctx: Context) {
    try {
      const cookies = new Cookies(ctx.req, ctx.res, {
        secure: process.env.NODE_ENV === "production",
      });
      const refreshToken = cookies.get("refreshToken");

      if (refreshToken) {
        await redis.del(`refresh_token:${refreshToken}`);
        // await redis.srem(
      }
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`);
    }
  }

  static async logoutAllSessions(ctx: Context) {}

  static async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = input;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .get();

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await db.insert(usersTable).values({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "user",
    });

    return { message: "Registration successful" };
  }

  static verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET!
      ) as { userId: number };

      if (!decoded || !decoded.userId) {
        return null;
      }

      return decoded.userId;
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }

  static async refreshAccessToken(input: string, ctx: Context) {
    try {
      const tokenExists = await redis.get(`refresh_token:${input}`);
      if (!tokenExists) {
        throw new Error("Invalid refresh token");
      }

      // verify the refresh token and gather userId
      const userId = this.verifyAccessToken(input);
      if (!userId) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = this.createAccessToken(userId);

      const cookies = new Cookies(ctx.req, ctx.res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", accessToken, {
        ...accessTokenCookieOptions,
      });
      cookies.set("loggedIn", "true", { ...accessTokenCookieOptions });

      return accessToken;
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  static createAccessToken(userId: number) {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
  }
}
