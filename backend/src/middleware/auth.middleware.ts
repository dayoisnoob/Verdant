import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.ts';
import { ApiError } from '../utils/api-response.js';
import { jwtVerify } from '../utils/jwt.util.js';
import { env } from '../config/env.ts';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isProd = env.NODE_ENV === 'production';

    const accessToken =
      req.cookies[isProd ? '__Secure-auth.access' : 'auth.access'];

    if (!accessToken?.trim()) {
      throw new ApiError(
        401,
        'Access denied. No valid authorization token provided'
      );
    }

    const decoded = jwtVerify(accessToken);

    if (!decoded.isActive) {
      throw new ApiError(
        403,
        'Your account has been suspended. Please contact support.'
      );
    }

    req.user = decoded;

    next();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token'));
    }

    if (err instanceof Error && err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token has expired'));
    }

    if (err instanceof ApiError) {
      return next(err);
    }

    logger.error(`Authentication middleware error: ${err}`);

    next(new ApiError(401, 'Authentication failed'));
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
};
