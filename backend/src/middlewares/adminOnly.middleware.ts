import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Obtener el token del header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    
    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Agregar el usuario al request para uso posterior
    req.user = user;

    return next();
  } catch (error) {
    console.error('Error en middleware adminOnly:', error);
    return res.status(401).json({ message: 'No autorizado' });
  }
}; 