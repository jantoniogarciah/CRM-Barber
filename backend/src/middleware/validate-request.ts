import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error: ValidationError) => ({
        message: error.msg,
        field: error.type === "field" ? error.path : undefined,
      })),
    });
  }

  next();
};
