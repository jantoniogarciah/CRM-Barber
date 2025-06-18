import { Request, Response } from "express";
import { prisma } from "../config/database";
import bcryptjs from "bcryptjs";

// Get all barbers
export const getBarbers = async (req: Request, res: Response) => {
  try {
    const showInactive = req.query.showInactive === "true";

    const barbers = await prisma.barber.findMany({
      where: showInactive
        ? undefined
        : {
            isActive: true,
          },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return res.status(500).json({ message: "Error al obtener los barberos" });
  }
};

// Get specific barber
export const getBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const barber = await prisma.barber.findUnique({
      where: { id },
    });

    if (!barber) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    return res.json(barber);
  } catch (error) {
    console.error("Error fetching barber:", error);
    return res.status(500).json({ message: "Error al obtener el barbero" });
  }
};

// Create barber
export const createBarber = async (req: Request, res: Response) => {
  try {
    console.log("Create barber request body:", req.body);
    const { firstName, lastName, phone, email, instagram } = req.body;

    // Validar campos requeridos
    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos excepto Instagram" 
      });
    }

    // Verificar si ya existe un barbero con ese email o teléfono
    const existingBarber = await prisma.barber.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingBarber) {
      return res.status(400).json({ 
        message: "Ya existe un barbero con ese email o teléfono" 
      });
    }

    // Generar una contraseña temporal
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(temporaryPassword, 10);

    // Crear el usuario primero
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "BARBER",
        status: "ACTIVE"
      }
    });

    // Crear el registro del barbero
    const barber = await prisma.barber.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        instagram,
        isActive: true
      }
    });

    // Devolver la información del barbero junto con la contraseña temporal
    return res.status(201).json({
      ...barber,
      temporaryPassword,
      message: "Barbero creado exitosamente. Por favor, guarda la contraseña temporal."
    });

  } catch (error) {
    console.error("Error creating barber:", error);
    return res.status(500).json({ message: "Error al crear el barbero" });
  }
};

// Update barber
export const updateBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, instagram } = req.body;

    const barber = await prisma.barber.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        email,
        instagram,
      },
    });

    return res.json(barber);
  } catch (error) {
    console.error("Error updating barber:", error);
    return res.status(500).json({ message: "Error al actualizar el barbero" });
  }
};

// Toggle barber status
export const toggleBarberStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const barber = await prisma.barber.findUnique({
      where: { id }
    });

    if (!barber) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: {
        isActive: !barber.isActive
      },
    });

    return res.json(updatedBarber);
  } catch (error) {
    console.error("Error toggling barber status:", error);
    return res.status(500).json({ message: "Error al cambiar el estado del barbero" });
  }
};

// Delete barber
export const deleteBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Primero encontrar el barbero para obtener su email
    const barber = await prisma.barber.findUnique({
      where: { id }
    });

    if (!barber) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    // Eliminar el usuario asociado
    if (barber.email) {
      await prisma.user.delete({
        where: { email: barber.email }
      });
    }

    // Eliminar el barbero
    await prisma.barber.delete({
      where: { id },
    });

    return res.json({ message: "Barbero eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting barber:", error);
    return res.status(500).json({ message: "Error al eliminar el barbero" });
  }
};
