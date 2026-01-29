import Cookies, { type SetOption } from "cookies";
import { env } from "../../env";
import type { Context } from "../../trpc";

// interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
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

export const cookieService = {
  getCookies(req: Context["req"], res: Context["res"]) {
    return new Cookies(req, res, {
      secure: env.NODE_ENV === "production",
    });
  },

  getCookieValues(req: Context["req"], res: Context["res"]) {
    const cookies = this.getCookies(req, res);
    return {
      accessToken: cookies.get("accessToken"),
      refreshToken: cookies.get("refreshToken"),
    };
  },

  clearCookies(ctx: Context) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("accessToken", "", {
      ...accessTokenCookieOptions,
    });
    cookies.set("refreshToken", "", {
      ...refreshTokenCookieOptions,
    });
    // cookies.set("loggedIn", "false", { ...accessTokenCookieOptions });
  },

  setAccessToken(ctx: Context, token: string) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("accessToken", token, {
      ...accessTokenCookieOptions,
    });
  },

  setRefreshToken(ctx: Context, token: string) {
    const cookies = this.getCookies(ctx.req, ctx.res);
    cookies.set("refreshToken", token, {
      ...refreshTokenCookieOptions,
    });
  },
};
