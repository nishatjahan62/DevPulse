import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "./issues.service";
import { sendSuccess, sendError } from "../../utils/response";
import {
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams,
} from "../../types";

// CREATE ISSUE

export const create = async (
  req: Request<object, object, CreateIssueBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reporterId = req.user!.id;
    const issue = await createIssue(req.body, reporterId);
    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (error) {
    if (error instanceof Error) {
      const errorMap: Record<string, [number, string, string]> = {
        MISSING_FIELDS: [
          StatusCodes.BAD_REQUEST,
          "Missing fields",
          "title, description and type are all required",
        ],
        TITLE_TOO_LONG: [
          StatusCodes.BAD_REQUEST,
          "Title too long",
          "Title must not exceed 150 characters",
        ],
        DESCRIPTION_TOO_SHORT: [
          StatusCodes.BAD_REQUEST,
          "Description too short",
          "Description must be at least 20 characters long",
        ],
        INVALID_TYPE: [
          StatusCodes.BAD_REQUEST,
          "Invalid type",
          "Type must be either bug or feature_request",
        ],
        REPORTER_NOT_FOUND: [
          StatusCodes.BAD_REQUEST,
          "Reporter not found",
          "The user creating this issue was not found in the database",
        ],
      };
      const mapped = errorMap[error.message];
      if (mapped) {
        sendError(res, mapped[0], mapped[1], mapped[2]);
        return;
      }
    }
    next(error);
  }
};

// GET ALL ISSUES

export const getAll = async (
  req: Request<object, object, object, IssueQueryParams>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const issues = await getAllIssues(req.query);
    sendSuccess(res, StatusCodes.OK, "Issues fetched successfully", issues);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE ISSUE

export const getOne = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid issue ID",
        "ID must be a valid number",
      );
      return;
    }

    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, "Issue fetched successfully", issue);
  } catch (error) {
    if (error instanceof Error && error.message === "ISSUE_NOT_FOUND") {
      sendError(
        res,
        StatusCodes.NOT_FOUND,
        "Issue not found",
        "No issue exists with the provided ID",
      );
      return;
    }
    next(error);
  }
};

// UPDATE ISSUE

export const update = async (
  req: Request<{ id: string }, object, UpdateIssueBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid issue ID",
        "ID must be a valid number",
      );
      return;
    }

    const requesterId = req.user!.id;
    const requesterRole = req.user!.role;

    const updated = await updateIssue(id, req.body, requesterId, requesterRole);
    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updated);
  } catch (error) {
    if (error instanceof Error) {
      const errorMap: Record<string, [number, string, string]> = {
        ISSUE_NOT_FOUND: [
          StatusCodes.NOT_FOUND,
          "Issue not found",
          "No issue exists with the provided ID",
        ],
        FORBIDDEN: [
          StatusCodes.FORBIDDEN,
          "Access denied",
          "You can only update issues that you created",
        ],
        ISSUE_NOT_OPEN: [
          StatusCodes.CONFLICT,
          "Issue not editable",
          "Contributors can only edit issues with open status",
        ],
        TITLE_TOO_LONG: [
          StatusCodes.BAD_REQUEST,
          "Title too long",
          "Title must not exceed 150 characters",
        ],
        DESCRIPTION_TOO_SHORT: [
          StatusCodes.BAD_REQUEST,
          "Description too short",
          "Description must be at least 20 characters long",
        ],
        INVALID_TYPE: [
          StatusCodes.BAD_REQUEST,
          "Invalid type",
          "Type must be either bug or feature_request",
        ],
        NO_FIELDS_TO_UPDATE: [
          StatusCodes.BAD_REQUEST,
          "No fields provided",
          "Provide at least one field to update: title, description or type",
        ],
      };
      const mapped = errorMap[error.message];
      if (mapped) {
        sendError(res, mapped[0], mapped[1], mapped[2]);
        return;
      }
    }
    next(error);
  }
};

// DELETE ISSUE

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid issue ID",
        "ID must be a valid number",
      );
      return;
    }

    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  } catch (error) {
    if (error instanceof Error && error.message === "ISSUE_NOT_FOUND") {
      sendError(
        res,
        StatusCodes.NOT_FOUND,
        "Issue not found",
        "No issue exists with the provided ID",
      );
      return;
    }
    next(error);
  }
};
