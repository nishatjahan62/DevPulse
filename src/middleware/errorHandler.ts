import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('🔥 Unhandled Error:', err.stack);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};