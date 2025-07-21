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

    // Obtener los clientes paginados con sus últimas visitas
    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        appointments: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
          where: {
            status: 'completed'
          }
        },
        sales: {
          orderBy: {
            saleDate: 'desc'
          },
          take: 1,
          where: {
            status: 'completed'
          }
        }
      },
      skip,
      take: limit,
    });

    // Procesar los clientes para determinar la última visita
    const processedClients = clients.map(client => {
      const lastAppointment = client.appointments[0];
      const lastSale = client.sales[0];

      let lastVisit = null;
      if (lastAppointment && lastSale) {
        // Usar saleDate para la comparación
        lastVisit = new Date(lastAppointment.date) > new Date(lastSale.saleDate)
          ? lastAppointment.date
          : lastSale.saleDate;
      } else if (lastAppointment) {
        lastVisit = lastAppointment.date;
      } else if (lastSale) {
        lastVisit = lastSale.saleDate;
      }

      // Eliminar los arrays de appointments y sales del resultado
      const { appointments, sales, ...clientData } = client;
      
      return {
        ...clientData,
        lastVisit: lastVisit ? new Date(lastVisit).toISOString() : null
      };
    });

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${clients.length} clients. Total: ${total}, Pages: ${totalPages}`);

    res.json({
      clients: processedClients,
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

    // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
    const cleanPhone = (phone as string).replace(/\D/g, '');
    
    console.log('Searching client by phone:', { original: phone, cleaned: cleanPhone });

    const client = await prisma.client.findFirst({
      where: {
        phone: cleanPhone,
        status: "ACTIVE",
      },
    });

    console.log('Search result:', client);

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

    // Limpiar el número de teléfono
    const cleanPhone = (phone as string).replace(/\D/g, '');
    
    console.log('Searching client by phone:', { original: phone, cleaned: cleanPhone });

    const client = await prisma.client.findFirst({
      where: {
        phone: cleanPhone,
        status: "ACTIVE",
      },
    });

    console.log('Search result:', client);

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.json(client);
  } catch (error) {
    console.error("Error searching client by phone:", error);
    return res.status(500).json({ message: "Error al buscar el cliente" });
  }
};

// Search clients by name or phone
export const searchClients = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "El término de búsqueda es requerido" });
    }

    const searchTerm = search as string;
    const searchWords = searchTerm.trim().split(/\s+/);
    
    console.log('Searching clients:', { searchTerm, searchWords });

    // Si el término parece ser un teléfono (solo contiene números)
    const isPhoneSearch = /^\d+$/.test(searchTerm.replace(/\D/g, ''));
    
    let whereClause: any = {
      status: "ACTIVE"
    };

    if (isPhoneSearch) {
      whereClause.phone = {
        contains: searchTerm.replace(/\D/g, '')
      };
    } else {
      // Búsqueda por nombre usando cada palabra del término de búsqueda
      whereClause.OR = searchWords.flatMap(word => [
        {
          firstName: {
            contains: word,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: word,
            mode: 'insensitive'
          }
        }
      ]);
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      take: 10,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    console.log(`Found ${clients.length} clients with search criteria:`, whereClause);

    return res.json(clients);
  } catch (error) {
    console.error("Error searching clients:", error);
    return res.status(500).json({ message: "Error al buscar clientes" });
  }
};
