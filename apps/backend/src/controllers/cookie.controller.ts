import Cookies, { type SetOption } from "cookies";
import config from "../lib/config";
import type { Context } from "../trpc";

// interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
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

export class CookieController {
  static getCookies(req: Context["req"], res: Context["res"]) {
    return new Cookies(req, res, {
      secure: config.NODE_ENV === "production",
    });
  }

  static getCookieValues(req: Context["req"], res: Context["res"]) {
    const cookies = this.getCookies(req, res);
    return {
      accessToken: cookies.get("accessToken"),
      refreshToken: cookies.get("refreshToken"),
    };
  }

  static clearCookies(ctx: Context) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("accessToken", "", {
      ...accessTokenCookieOptions,
    });
    cookies.set("refreshToken", "", {
      ...refreshTokenCookieOptions,
    });
    // cookies.set("loggedIn", "false", { ...accessTokenCookieOptions });
  }

  static setAccessToken(ctx: Context, token: string) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("accessToken", token, {
      ...accessTokenCookieOptions,
    });
  }

  static setRefreshToken(ctx: Context, token: string) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("refreshToken", token, {
      ...refreshTokenCookieOptions,
    });
  }
}
