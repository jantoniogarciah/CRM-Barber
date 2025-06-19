import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

// Use the generated Prisma types
type UserStatus = Prisma.UserCreateInput['status'];

// Get all clients
export const getClients = async (req: Request, res: Response) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const phone = req.query.phone as string;

    console.log('Fetching clients with params:', { showInactive, phone });

    const whereClause = {
      ...(showInactive ? {} : { status: "ACTIVE" }),
      ...(phone ? { phone: { contains: phone } } : {}),
    };

    console.log('Where clause:', whereClause);

    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${clients.length} clients`);

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

    const client = await prisma.user.findUnique({
      where: {
        id,
        role: "CLIENT"
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.json(client);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching client" });
  }
};

// Create client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, notes } = req.body;

    // Verificar si ya existe un cliente con ese teléfono, sin importar su estado
    const existingClient = await prisma.client.findFirst({
      where: { phone },
    });

    if (existingClient) {
      return res.status(400).json({
        message: "Ya existe un cliente con este número de teléfono",
        existingClient: {
          id: existingClient.id,
          firstName: existingClient.firstName,
          lastName: existingClient.lastName,
          phone: existingClient.phone,
          status: existingClient.status,
          createdAt: existingClient.createdAt,
        },
      });
    }

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        notes,
        status: "ACTIVE",
      },
    });

    return res.status(201).json(client);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // El error P2002 es para violaciones de unicidad
      if (error.code === 'P2002') {
        return res.status(400).json({
          message: "Ya existe un cliente con este número de teléfono",
        });
      }
    }
    console.error("Error creating client:", error);
    return res.status(500).json({ message: "Error al crear el cliente" });
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
      where: { id }
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        status: client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    return res.json(updatedClient);
  } catch (error) {
    console.error("Error toggling client status:", error);
    return res.status(500).json({ message: "Error al cambiar el estado del cliente" });
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

// Get client by phone
export const getClientByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "El teléfono es requerido" });
    }

    const client = await prisma.client.findFirst({
      where: {
        phone: phone as string,
        status: "ACTIVE",
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.json(client);
  } catch (error) {
    console.error("Error searching client by phone:", error);
    return res.status(500).json({ message: "Error al buscar el cliente" });
  }
};
