import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Create user
export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, status, phone } = req.body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está actualizando el email, verificar que no exista
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        role,
        status,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // En lugar de eliminar, marcar como inactivo
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}; 