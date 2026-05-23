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
      sendError(res, StatusCodes.BAD_REQUEST, 'All fields required', 'name, email, password and role must be provided');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid email format', 'Please provide a valid email address like john@example.com');
      return;
    }

    if (password.length < 6) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Password too short', 'Password must be at least 6 characters long');
      return;
    }

    const newUser = await registerUser({ name, email, password, role });
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', newUser);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EMAIL_EXISTS') {
        sendError(res, StatusCodes.BAD_REQUEST, 'Email already registered', 'An account with this email already exists, please login instead');
        return;
      }
      if (error.message === 'INVALID_ROLE') {
        sendError(res, StatusCodes.BAD_REQUEST, 'Invalid role', 'Role must be either contributor or maintainer');
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
      sendError(res, StatusCodes.BAD_REQUEST, 'Missing credentials', 'Both email and password are required to login');
      return;
    }

    const result = await loginUser({ email, password });
    sendSuccess(res, StatusCodes.OK, 'Login successful', result);

  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials', 'Email or password is incorrect');
      return;
    }
    next(error);
  }
};