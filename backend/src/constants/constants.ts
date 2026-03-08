import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: +env.REFRESH_COOKIE_MAX_AGE,
  path: '/api/auth',
};
