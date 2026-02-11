import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { SetOption } from 'cookies';
import Cookies from 'cookies';

const defaultCookieOptions: SetOption = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
};

const defaultCookieAges = {
  accessToken: 15 * 60 * 1000, // 15 minutes
  refreshToken: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class CookieService {
  cookieOptions: SetOption = defaultCookieOptions;
  cookieAges = defaultCookieAges;
  constructor(config?: SetOption, cookieAges?: typeof defaultCookieAges) {
    if (config?.secure !== undefined) {
      this.cookieOptions = { ...defaultCookieOptions, ...config };
    }
    if (cookieAges) {
      this.cookieAges = { ...defaultCookieAges, ...cookieAges };
    }
  }

  getCookies(
    req: CreateExpressContextOptions['req'],
    res: CreateExpressContextOptions['res'],
  ) {
    return new Cookies(req, res, {
      secure: this.cookieOptions.secure,
    });
  }

  getCookieValues(
    req: CreateExpressContextOptions['req'],
    res: CreateExpressContextOptions['res'],
  ) {
    const cookies = this.getCookies(req, res);
    return {
      accessToken: cookies.get('accessToken'),
      refreshToken: cookies.get('refreshToken'),
    };
  }

  clearCookies(
    req: CreateExpressContextOptions['req'],
    res: CreateExpressContextOptions['res'],
  ) {
    const cookies = this.getCookies(req, res);
    cookies.set('accessToken', '', {
      ...this.cookieOptions,
    });
    cookies.set('refreshToken', '', {
      ...this.cookieOptions,
    });
  }

  setAccessToken(
    req: CreateExpressContextOptions['req'],
    res: CreateExpressContextOptions['res'],
    token: string,
  ) {
    const cookies = this.getCookies(req, res);
    cookies.set('accessToken', token, {
      ...this.cookieOptions,
      maxAge: this.cookieAges.accessToken,
    });
  }

  setRefreshToken(
    req: CreateExpressContextOptions['req'],
    res: CreateExpressContextOptions['res'],
    token: string,
  ) {
    const cookies = this.getCookies(req, res);
    cookies.set('refreshToken', token, {
      ...this.cookieOptions,
      maxAge: this.cookieAges.refreshToken,
    });
  }
}
