import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('No estás autenticado. Por favor, inicia sesión.', 401);
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('El usuario de este token ya no existe.', 401);
    }

    // 4) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
