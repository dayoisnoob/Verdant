import type { JwtPayload } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      parsedQuery?: Record<string, unknown>;
    }
  }
}

export {};
