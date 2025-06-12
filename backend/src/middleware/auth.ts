import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/jwt";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ message: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log('Invalid token format - missing Bearer prefix');
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log('Token is empty after Bearer prefix');
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
      
      if (!decoded || !decoded.id) {
        console.log('Invalid token payload:', decoded);
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.user = decoded;
      return next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.log('Token expired');
        return res.status(401).json({ message: "Token expired" });
      }
      if (err instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token:', err.message);
        return res.status(401).json({ message: "Invalid token" });
      }
      throw err;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: "Error authenticating user" });
  }
};
