import { Request, Response } from "express";
import { prisma } from "../config/database";
import { Service } from "@prisma/client";

// Get all services
export const getServices = async (req: Request, res: Response) => {
  try {
    const showInactive = req.query.showInactive === "true";

    const services = await prisma.service.findMany({
      where: showInactive
        ? undefined
        : {
            isActive: true,
          },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Error al obtener los servicios" });
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        services: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

// Get specific service
export const getService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Error fetching service" });
  }
};

// Create service
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, categoryId } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error al crear el servicio" });
  }
};

// Update service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, categoryId } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error al actualizar el servicio" });
  }
};

// Toggle service status
export const toggleServiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        isActive: !service.isActive,
      },
      include: {
        category: true,
      },
    });

    res.json(updatedService);
  } catch (error) {
    console.error("Error toggling service status:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el estado del servicio" });
  }
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id },
    });

    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Error al eliminar el servicio" });
  }
};
