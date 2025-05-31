import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT secret not configured", 500);
    }

    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        throw new AppError("Invalid token", 403);
      }

      req.user = decoded as JwtPayload;
      next();
    });
  } catch (error) {
    next(error);
  }
};
