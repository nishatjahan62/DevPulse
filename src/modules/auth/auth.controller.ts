import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { registerUser, loginUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { SignupBody, LoginBody } from '../../types';

export const signup = async (
  req: Request<object, object, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      sendError(res, StatusCodes.BAD_REQUEST, 'All fields required: name, email, password, role');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid email format');
      return;
    }

    if (password.length < 6) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Password must be at least 6 characters');
      return;
    }

    const newUser = await registerUser({ name, email, password, role });
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', newUser);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EMAIL_EXISTS') {
        sendError(res, StatusCodes.BAD_REQUEST, 'Email already registered');
        return;
      }
      if (error.message === 'INVALID_ROLE') {
        sendError(res, StatusCodes.BAD_REQUEST, 'Role must be contributor or maintainer');
        return;
      }
    }
    next(error);
  }
};

export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Email and password are required');
      return;
    }

    const result = await loginUser({ email, password });
    sendSuccess(res, StatusCodes.OK, 'Login successful', result);

  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid email or password');
      return;
    }
    next(error);
  }
};