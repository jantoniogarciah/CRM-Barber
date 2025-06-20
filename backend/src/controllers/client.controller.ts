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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log('Fetching clients with params:', { showInactive, phone, page, limit });

    // Construir where clause
    const whereClause = {
      ...(showInactive ? {} : { status: "ACTIVE" }),
      ...(phone ? { phone: { contains: phone } } : {}),
    };

    console.log('Where clause:', whereClause);

    // Obtener el total de registros para la paginación
    const total = await prisma.client.count({
      where: whereClause,
    });

    // Obtener los clientes paginados
    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${clients.length} clients. Total: ${total}, Pages: ${totalPages}`);

    res.json({
      clients,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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

    console.log('Creating client with data:', { firstName, lastName, email, phone, notes });

    // Verificar formato del teléfono
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      console.log('Invalid phone format:', { original: phone, cleaned: cleanPhone });
      return res.status(400).json({
        message: "El teléfono debe tener exactamente 10 dígitos",
      });
    }

    // Buscar cliente existente con logs detallados
    console.log('Searching for existing client with phone:', cleanPhone);
    
    // Primero buscar coincidencia exacta
    const exactMatch = await prisma.client.findFirst({
      where: {
        phone: cleanPhone
      },
    });

    console.log('Exact match search result:', exactMatch);

    if (exactMatch) {
      console.log('Found exact match:', exactMatch);
      return res.status(400).json({
        message: `Ya existe un cliente con este número de teléfono: ${exactMatch.firstName} ${exactMatch.lastName} (${exactMatch.status})`,
        existingClient: {
          id: exactMatch.id,
          firstName: exactMatch.firstName,
          lastName: exactMatch.lastName,
          phone: exactMatch.phone,
          status: exactMatch.status,
          createdAt: exactMatch.createdAt,
        },
      });
    }

    // Buscar coincidencias parciales para debugging
    const similarMatches = await prisma.client.findMany({
      where: {
        phone: {
          contains: cleanPhone
        }
      }
    });

    console.log('Similar matches found:', similarMatches);

    // Si llegamos aquí, no hay cliente existente con ese teléfono
    console.log('No existing client found, creating new client');

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        phone: cleanPhone,
        notes,
        status: "ACTIVE",
      },
    });

    console.log('Client created successfully:', client);

    return res.status(201).json(client);
  } catch (error) {
    console.error('Error in createClient:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log('Prisma error details:', {
        code: error.code,
        meta: error.meta,
        message: error.message
      });
      
      // El error P2002 es para violaciones de unicidad
      if (error.code === 'P2002') {
        return res.status(400).json({
          message: "Ya existe un cliente con este número de teléfono",
          error: 'UNIQUE_CONSTRAINT_VIOLATION',
          field: error.meta?.target
        });
      }
    }
    return res.status(500).json({ 
      message: "Error al crear el cliente",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Añadir función específica para buscar por teléfono
export const searchClientByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "El número de teléfono es requerido" });
    }

    console.log('Searching client by phone:', phone);

    const clients = await prisma.client.findMany({
      where: {
        phone: {
          contains: phone as string,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${clients.length} clients with phone containing: ${phone}`);

    return res.json(clients);
  } catch (error) {
    console.error("Error searching client by phone:", error);
    return res.status(500).json({ message: "Error al buscar el cliente" });
  }
};
