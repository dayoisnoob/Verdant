import type { CookieOptions } from 'express';
import { env } from './config/env';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: +env.REFRESH_COOKIE_MAX_AGE,
  path: '/',
  domain:
    process.env.NODE_ENV === 'production' ? '.shopverdant.store' : undefined,
};

export const RESEND_COOLDOWN_SECONDS = 60;

export const FIVE_MIN_CACHE = 300;
export const TEN_MIN_CACHE = 600;
export const ONE_HOUR_CACHE = 3600;
