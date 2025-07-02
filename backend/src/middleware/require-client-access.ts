import { Request, Response, NextFunction } from "express";

export const requireClientAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const allowedRoles = ['BARBER', 'ADMIN', 'ADMINBARBER'];

    console.log('requireClientAccess - User role:', user?.role);
    console.log('requireClientAccess - Allowed roles:', allowedRoles);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Acceso permitido solo para barberos y administradores." });
    }

    return next();
  } catch (error) {
    console.error("Error al verificar el acceso a clientes:", error);
    return res.status(500).json({ message: "Error al verificar el acceso" });
  }
}; 