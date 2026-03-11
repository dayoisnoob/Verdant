import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: +env.REFRESH_COOKIE_MAX_AGE,
  path: '/',
};
