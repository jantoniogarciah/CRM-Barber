import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

type UserRole = Prisma.UserCreateInput['role'];

export const requireBarber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const allowedRoles = ['BARBER', 'ADMIN', 'ADMINBARBER'];

    console.log('requireBarber - User role:', user?.role);
    console.log('requireBarber - Allowed roles:', allowedRoles);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Acceso permitido solo para barberos y administradores." });
    }

    return next();
  } catch (error) {
    console.error("Error al verificar el rol de barbero:", error);
    return res.status(500).json({ message: "Error al verificar el rol de barbero" });
  }
}; 