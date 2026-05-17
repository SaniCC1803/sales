import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const ONE_HOUR = 60 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  // The Secure flag requires HTTPS. Default to whatever NODE_ENV implies,
  // but allow HTTP-only deployments to opt out via COOKIE_SECURE=false
  // (e.g., while TLS isn't set up yet).
  const defaultSecure = process.env.NODE_ENV === 'production';
  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : defaultSecure;
  return {
    httpOnly: true,
    secure,
    // 'lax' works same-origin (via the proxy) and also lets confirmation-email
    // links carry the auth cookie on top-level navigation.
    sameSite: 'lax',
    path: '/',
  };
}

export function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: ONE_HOUR,
  });
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: SEVEN_DAYS,
  });
}

export function clearAuthCookies(res: Response): void {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}
