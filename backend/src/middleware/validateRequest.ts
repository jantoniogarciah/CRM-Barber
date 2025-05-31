import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new AppError(errorMessages.join(", "), 400);
  }
  next();
};
