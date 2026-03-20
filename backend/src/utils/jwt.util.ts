import jwt, { type SignOptions } from 'jsonwebtoken';
import type { JwtPayload } from '../types/types';
import { env } from '../config/env';

export const jwtToken = (payload: JwtPayload) => {
  const tokenSecret = env.JWT_ACCESS_TOKEN;
  const tokenExpiry = env.JWT_ACCESS_TOKEN_EXPIRY;

  const options: SignOptions = {
    expiresIn: tokenExpiry as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, tokenSecret, options);
};

export const jwtVerify = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_TOKEN) as {
    id: string;
    role: 'customer' | 'admin';
    email: string;
    isActive: boolean;
  };
};
