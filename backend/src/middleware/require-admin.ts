import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser || req.currentUser.role.toUpperCase() !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};
