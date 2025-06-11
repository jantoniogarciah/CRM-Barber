import { Request, Response } from "express";
import { prisma } from "../config/database";

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

    res.json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    res.status(500).json({ message: "Error al obtener los barberos" });
  }
};

// Get specific barber
export const getBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const barber = await prisma.user.findUnique({
      where: {
        id,
        role: "BARBER",
      },
    });

    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    return res.json(barber);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching barber" });
  }
};

// Create barber
export const createBarber = async (req: Request, res: Response) => {
  try {
    console.log("Create barber request body:", req.body);
    const { firstName, lastName, phone, email, instagram } = req.body;

    // Log individual fields
    console.log("Extracted fields:", {
      firstName,
      lastName,
      phone,
      email,
      instagram,
    });

    const barber = await prisma.barber.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        instagram,
        isActive: true,
      },
    });

    res.status(201).json(barber);
  } catch (error) {
    console.error("Error creating barber:", error);
    res.status(500).json({ message: "Error al crear el barbero" });
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

    res.json(barber);
  } catch (error) {
    console.error("Error updating barber:", error);
    res.status(500).json({ message: "Error al actualizar el barbero" });
  }
};

// Toggle barber status
export const toggleBarberStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const barber = await prisma.user.findUnique({
      where: {
        id,
        role: "BARBER",
      },
    });

    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    const updatedBarber = await prisma.user.update({
      where: { id },
      data: {
        status: barber.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });

    return res.json(updatedBarber);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling barber status" });
  }
};

// Delete barber
export const deleteBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.barber.delete({
      where: { id },
    });

    res.json({ message: "Barbero eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting barber:", error);
    res.status(500).json({ message: "Error al eliminar el barbero" });
  }
};
