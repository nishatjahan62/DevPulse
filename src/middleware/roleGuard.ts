import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'maintainer') {
  sendError(res, StatusCodes.FORBIDDEN, 'Access denied. Maintainer role required.', 'You need maintainer role to perform this action');

    return;
  }
  next();
};