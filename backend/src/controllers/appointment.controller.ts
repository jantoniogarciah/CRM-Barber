import { Request, Response } from "express";
import { PrismaClient, Client } from "@prisma/client";
import { AppError } from "../utils/appError";
import { parseISO } from "date-fns";

const prisma = new PrismaClient();

// Función auxiliar para ajustar la fecha a la zona horaria correcta
const adjustDateToUTC = (dateStr: string) => {
  // Crear una fecha con la zona horaria local del usuario
  const localDate = new Date(dateStr);
  
  // Ajustar 6 horas (zona horaria de México)
  localDate.setHours(6, 0, 0, 0);
  
  return localDate;
};

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, name, phone, status } = req.query;

    console.log('Received query params:', {
      startDate,
      endDate,
      name,
      phone,
      status
    });

    // Construir el where clause
    const whereClause: any = {};

    // Agregar filtros de fecha si están presentes
    if (startDate || endDate) {
      whereClause.date = {};
      
      if (startDate) {
        const startDateTime = adjustDateToUTC(startDate as string);
        whereClause.date.gte = startDateTime;
        console.log('Start date filter:', startDateTime.toISOString());
      }
      
      if (endDate) {
        const endDateTime = adjustDateToUTC(endDate as string);
        endDateTime.setHours(29, 59, 59, 999); // 29 horas para cubrir todo el día en UTC
        whereClause.date.lte = endDateTime;
        console.log('End date filter:', endDateTime.toISOString());
      }
    }

    // Agregar filtro por estado
    if (status) {
      whereClause.status = status;
    }

    // Agregar filtros de cliente (nombre y teléfono)
    if (name || phone) {
      whereClause.client = {};
      
      if (name) {
        whereClause.client.OR = [
          {
            firstName: {
              contains: name as string,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: name as string,
              mode: 'insensitive'
            }
          }
        ];
      }
      
      if (phone) {
        whereClause.client.phone = {
          contains: phone as string
        };
      }
    }

    console.log('Final where clause:', JSON.stringify(whereClause, null, 2));

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        barber: true,
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          time: "asc",
        },
      ],
    });

    console.log('Found appointments:', appointments.length);
    if (appointments.length > 0) {
      console.log('Sample appointment dates:');
      appointments.slice(0, 3).forEach(app => {
        console.log(`- ${app.date.toISOString()} (${app.time})`);
      });
    }

    res.json({
      appointments,
      total: appointments.length
    });
  } catch (error) {
    console.error("Error getting appointments:", error);
    throw new AppError("Error getting appointments", 500);
  }
};

// Get single appointment
export const getAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error getting appointment:", error);
    throw new AppError("Error getting appointment", 500);
  }
};

// Create appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { clientId, serviceId, barberId, date, time, status, notes } = req.body;

    console.log('Creating appointment with data:', {
      clientId,
      serviceId,
      barberId,
      date,
      time,
      status,
      notes
    });

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Validate that client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new AppError("Client not found", 404);
    }

    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new AppError("Service not found", 404);
    }

    // Validate barber exists
    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!barber) {
      throw new AppError("Barber not found", 404);
    }

    // Ajustar la fecha a UTC
    const appointmentDate = adjustDateToUTC(date);
    console.log('Appointment date being saved:', appointmentDate.toISOString());

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        barberId,
        date: appointmentDate,
        time,
        status: status || 'pending',
        notes,
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    console.log('Created appointment:', appointment);

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Error creating appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientId, serviceId, barberId, date, time, status, notes } = req.body;

    console.log('Updating appointment with data:', {
      id,
      clientId,
      serviceId,
      barberId,
      date,
      time,
      status,
      notes
    });

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Validate client exists if provided
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new AppError("Client not found", 404);
      }
    }

    // Validate service exists if provided
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new AppError("Service not found", 404);
      }
    }

    // Validate barber exists if provided
    if (barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: barberId },
      });
      if (!barber) {
        throw new AppError("Barber not found", 404);
      }
    }

    // Ajustar la fecha a UTC si se proporciona
    let appointmentDate;
    if (date) {
      appointmentDate = adjustDateToUTC(date);
      console.log('Appointment date being updated to:', appointmentDate.toISOString());
    }

    const updateData = {
      ...(clientId && { clientId }),
      ...(serviceId && { serviceId }),
      ...(barberId && { barberId }),
      ...(date && { date: appointmentDate }),
      ...(time && { time }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    };

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    console.log('Updated appointment:', appointment);

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Error updating appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new AppError("Appointment not found", 404);
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw new AppError("Error deleting appointment", 500);
  }
};

// Get last completed appointment for each client
export const getLastCompletedAppointments = async (req: Request, res: Response) => {
  try {
    // Get all clients
    const clients = await prisma.client.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    // Get the last completed appointment for each client
    const lastAppointments = await Promise.all(
      clients.map(async (client) => {
        const lastAppointment = await prisma.appointment.findFirst({
          where: {
            clientId: client.id,
            status: "completed",
          },
          orderBy: {
            date: "desc",
          },
          include: {
            service: true,
            barber: true,
          },
        });
        return {
          clientId: client.id,
          appointment: lastAppointment,
        };
      })
    );

    // Convert array to object with clientId as key
    const appointmentsMap = lastAppointments.reduce((acc, curr) => {
      if (curr.appointment) {
        acc[curr.clientId] = curr.appointment;
      }
      return acc;
    }, {} as { [key: string]: any });

    res.json(appointmentsMap);
  } catch (error) {
    console.error("Error getting last completed appointments:", error);
    throw new AppError("Error getting last completed appointments", 500);
  }
};

const getClientAppointments = async (client: Client) => {
  // ... rest of the function
};

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getLastCompletedAppointments,
};
