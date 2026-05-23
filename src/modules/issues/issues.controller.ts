import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
} from './issues.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateIssueBody, UpdateIssueBody, IssueQueryParams } from '../../types';

//  CREATE ISSUE 

export const create = async (
  req: Request<object, object, CreateIssueBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
   
    const reporterId = req.user!.id;

    const issue = await createIssue(req.body, reporterId);
    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
  } catch (error) {
    if (error instanceof Error) {
      const errorMap: Record<string, [number, string]> = {
        MISSING_FIELDS: [StatusCodes.BAD_REQUEST, 'Title, description, and type are required'],
        TITLE_TOO_LONG: [StatusCodes.BAD_REQUEST, 'Title must not exceed 150 characters'],
        DESCRIPTION_TOO_SHORT: [StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
        INVALID_TYPE: [StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
        REPORTER_NOT_FOUND: [StatusCodes.BAD_REQUEST, 'Reporter user not found']
      };
      const mapped = errorMap[error.message];
      if (mapped) {
        sendError(res, mapped[0], mapped[1]);
        return;
      }
    }
    next(error);
  }
};

//  GET ALL ISSUES 

export const getAll = async (
  req: Request<object, object, object, IssueQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issues = await getAllIssues(req.query);
    sendSuccess(res, StatusCodes.OK, 'Issues fetched successfully', issues);
  } catch (error) {
    next(error);
  }
};

//  GET SINGLE ISSUE 

export const getOne = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }

    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, 'Issue fetched successfully', issue);
  } catch (error) {
    if (error instanceof Error && error.message === 'ISSUE_NOT_FOUND') {
      sendError(res, StatusCodes.NOT_FOUND, 'Issue not found');
      return;
    }
    next(error);
  }
};

//  UPDATE ISSUE 

export const update = async (
  req: Request<{ id: string }, object, UpdateIssueBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }

    const requesterId = req.user!.id;
    const requesterRole = req.user!.role;

    const updated = await updateIssue(id, req.body, requesterId, requesterRole);
    sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', updated);
  } catch (error) {
    if (error instanceof Error) {
      const errorMap: Record<string, [number, string]> = {
        ISSUE_NOT_FOUND: [StatusCodes.NOT_FOUND, 'Issue not found'],
        FORBIDDEN: [StatusCodes.FORBIDDEN, 'You can only update your own issues'],
        ISSUE_NOT_OPEN: [StatusCodes.CONFLICT, 'Contributors can only edit open issues'],
        TITLE_TOO_LONG: [StatusCodes.BAD_REQUEST, 'Title must not exceed 150 characters'],
        DESCRIPTION_TOO_SHORT: [StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
        INVALID_TYPE: [StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
        NO_FIELDS_TO_UPDATE: [StatusCodes.BAD_REQUEST, 'No fields provided to update']
      };
      const mapped = errorMap[error.message];
      if (mapped) {
        sendError(res, mapped[0], mapped[1]);
        return;
      }
    }
    next(error);
  }
};

//  DELETE ISSUE 

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }

    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully', null);
  } catch (error) {
    if (error instanceof Error && error.message === 'ISSUE_NOT_FOUND') {
      sendError(res, StatusCodes.NOT_FOUND, 'Issue not found');
      return;
    }
    next(error);
  }
};