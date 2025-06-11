import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking admin status" });
  }
};
