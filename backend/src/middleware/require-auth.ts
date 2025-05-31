import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.status === "INACTIVE") {
        return res.status(403).json({ message: "Account is inactive" });
      }

      req.currentUser = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Error checking authentication" });
  }
};
