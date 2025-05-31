import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        service: true,
        barber: true,
      },
      orderBy: [
        {
          barber: {
            firstName: "asc",
          },
        },
        {
          date: "asc",
        },
        {
          time: "asc",
        },
      ],
    });
    res.json(appointments);
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
    const { clientId, serviceId, barberId, date, time, status, notes } =
      req.body;

    // Validate that client, service, and barber exist
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new AppError("Client not found", 404);
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new AppError("Service not found", 404);
    }

    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!barber) {
      throw new AppError("Barber not found", 404);
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        barberId,
        date,
        time,
        status,
        notes,
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new AppError("Error creating appointment", 500);
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientId, serviceId, barberId, date, time, status, notes } =
      req.body;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new AppError("Appointment not found", 404);
    }

    // If clientId is provided, validate that client exists
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new AppError("Client not found", 404);
      }
    }

    // If serviceId is provided, validate that service exists
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new AppError("Service not found", 404);
      }
    }

    // If barberId is provided, validate that barber exists
    if (barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: barberId },
      });
      if (!barber) {
        throw new AppError("Barber not found", 404);
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        clientId,
        serviceId,
        barberId,
        date,
        time,
        status,
        notes,
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new AppError("Error updating appointment", 500);
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
