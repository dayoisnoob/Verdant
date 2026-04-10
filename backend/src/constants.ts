import type { CookieOptions } from 'express';
import { env } from './config/env';

const isProd = env.NODE_ENV === 'production';
export const REFRESH_COOKIE = isProd ? '__auth.refresh' : 'auth.refresh';
export const ACCESS_COOKIE = isProd ? '__auth.access' : 'auth.access';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: +env.REFRESH_COOKIE_MAX_AGE,
  path: '/',
  domain: isProd ? '.shopverdant.store' : undefined,
};

export const RESEND_COOLDOWN_SECONDS = 60;

export const FIVE_MIN_CACHE = 300;
export const TEN_MIN_CACHE = 600;
export const ONE_HOUR_CACHE = 3600;
