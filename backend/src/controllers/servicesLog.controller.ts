import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

// Get services log for a barber
export const getServicesLog = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;

    const servicesLog = await prisma.serviceLog.findMany({
      where: {
        barberId,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        barber: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(servicesLog);
  } catch (error) {
    console.error('Error fetching services log:', error);
    return res.status(500).json({ message: 'Error al obtener el registro de servicios' });
  }
};

// Create service log entry
export const createServiceLog = async (req: Request, res: Response) => {
  try {
    const { barberId, serviceId, clientPhone, notes } = req.body;

    // Verificar que el cliente existe
    const client = await prisma.client.findFirst({
      where: { phone: clientPhone },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar que el barbero existe
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }

    // Verificar que el servicio existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Crear el registro del servicio
    const serviceLog = await prisma.serviceLog.create({
      data: {
        barberId,
        serviceId,
        clientId: client.id,
        notes,
        date: new Date(),
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        barber: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.status(201).json(serviceLog);
  } catch (error) {
    console.error('Error creating service log:', error);
    return res.status(500).json({ message: 'Error al registrar el servicio' });
  }
}; 