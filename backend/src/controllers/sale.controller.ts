import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

// Get all sales
export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        client: true,
        service: true,
        barber: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error getting sales:", error);
    throw new AppError("Error al obtener las ventas", 500);
  }
};

// Get sale by ID
export const getSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.json(sale);
  } catch (error) {
    console.error("Error getting sale:", error);
    throw new AppError("Error al obtener la venta", 500);
  }
};

// Create sale
export const createSale = async (req: Request, res: Response) => {
  try {
    const { clientId, serviceId, barberId, amount, notes } = req.body;

    // Validate that client exists or create new one
    let client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: clientId },
          { phone: clientId } // Allow searching by phone number
        ]
      }
    });

    if (!client && req.body.newClient) {
      // Create new client if not found
      client = await prisma.client.create({
        data: {
          firstName: req.body.newClient.firstName,
          lastName: req.body.newClient.lastName,
          phone: req.body.newClient.phone,
          email: req.body.newClient.email,
        }
      });
    } else if (!client) {
      throw new AppError("Cliente no encontrado", 404);
    }

    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new AppError("Servicio no encontrado", 404);
    }

    // Validate barber exists
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });
    if (!barber) {
      throw new AppError("Barbero no encontrado", 404);
    }

    const sale = await prisma.sale.create({
      data: {
        clientId: client.id,
        serviceId,
        barberId,
        amount: amount || service.price,
        status: "completed",
        notes,
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error al crear la venta", 500);
  }
};

// Update sale
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        status: status as "completed" | "cancelled" | "refunded",
        notes,
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    return res.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    throw new AppError("Error al actualizar la venta", 500);
  }
}; 