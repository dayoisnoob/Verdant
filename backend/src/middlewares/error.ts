import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../config/pino';

export function notFoundError(req: Request, res: Response) {
  throw new ApiError(404, `Route: ${req.originalUrl} not found`);
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else {
    const statusCode = (err as any).statusCode || 500;
    const message = err.message || 'Internal server error';
    error = new ApiError(statusCode, message);
  }

  const isOperational = error.isOperational === true;
  const statusCode = error.statusCode;

  logger.error({
    statusCode,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: !isOperational ? error.stack : undefined,
  });

  const response: any = {
    success: false,
    message: isOperational ? error.message : 'Internal server error',
    ...(error.details && { details: error.details }),
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(statusCode).json(response);
}
