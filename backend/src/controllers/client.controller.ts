import { Request, Response } from "express";
import { prisma } from "../config/database";

// Get all clients
export const getClients = async (req: Request, res: Response) => {
  try {
    const showInactive = req.query.showInactive === "true";

    const clients = await prisma.client.findMany({
      where: showInactive
        ? undefined
        : {
            isActive: true,
          },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
};

// Get specific client
export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ message: "Error al obtener el cliente" });
  }
};

// Create client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, notes } = req.body;

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        notes,
        isActive: true,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Error al crear el cliente" });
  }
};

// Update client
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, notes } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        notes,
      },
    });

    res.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Error al actualizar el cliente" });
  }
};

// Toggle client status
export const toggleClientStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        isActive: !client.isActive,
      },
    });

    res.json(updatedClient);
  } catch (error) {
    console.error("Error toggling client status:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el estado del cliente" });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id },
    });

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Error al eliminar el cliente" });
  }
};
