import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

type UserRole = Prisma.UserCreateInput['role'];

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking admin role" });
  }
};
