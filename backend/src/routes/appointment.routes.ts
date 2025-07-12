import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getLastCompletedAppointments,
} from "../controllers/appointment.controller";
import { validateRequest } from "../middleware/validateRequest";
import { requireAuth } from "../middleware/require-auth";
import { requireBarber } from "../middleware/require-barber";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router: Router = Router();

// Crear un router separado para rutas protegidas
const protectedRouter: Router = Router();

// Public route for creating appointments from the website
router.post(
  "/public",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a new client if doesn't exist
      const client = await prisma.client.upsert({
        where: { phone: req.body.phone },
        update: {
          firstName: req.body.name,
          email: req.body.email
        },
        create: {
          firstName: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          lastName: ""
        }
      });

      // Get default service and barber
      const service = await prisma.service.findFirst({
        where: {
          name: {
            contains: 'Corte',
            mode: 'insensitive'
          },
          isActive: true
        }
      });

      console.log('Service search criteria:', {
        name: { contains: 'Corte', mode: 'insensitive' },
        isActive: true
      });
      console.log('Found service:', service);

      if (!service) {
        return res.status(500).json({ 
          message: "Error: No se encontró el servicio de corte. Por favor, contacta al administrador." 
        });
      }

      // First try to find all active barbers to debug
      const allActiveBarbers = await prisma.barber.findMany({
        where: { isActive: true }
      });
      console.log('All active barbers:', allActiveBarbers);

      const barber = await prisma.barber.findFirst({
        where: {
          firstName: {
            equals: 'Barbero',
            mode: 'insensitive'
          },
          lastName: {
            equals: 'ClipperCut',
            mode: 'insensitive'
          },
          isActive: true
        }
      });

      console.log('Barber search criteria:', {
        firstName: { equals: 'Barbero', mode: 'insensitive' },
        lastName: { equals: 'ClipperCut', mode: 'insensitive' },
        isActive: true
      });
      console.log('Barber search result:', barber);

      if (!barber) {
        return res.status(500).json({ 
          message: "Error: No se encontró el barbero disponible. Por favor, contacta al administrador.",
          debug: {
            activeBarbers: allActiveBarbers
          }
        });
      }

      // Create the appointment
      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          barberId: barber.id,
          date: new Date(`${req.body.date}T${req.body.time}:00.000Z`),
          time: req.body.time,
          status: 'pending',
          notes: 'Cita creada desde la página web'
        },
        include: {
          service: true,
          barber: true,
          client: true
        }
      });

      // Formatear la respuesta para el cliente
      const formattedResponse = {
        message: "¡Cita agendada con éxito! Te contactaremos para confirmar.",
        appointment: {
          ...appointment,
          serviceName: appointment.service.name,
          barberName: `${appointment.barber.firstName} ${appointment.barber.lastName}`,
          clientName: `${appointment.client.firstName} ${appointment.client.lastName}`
        }
      };

      return res.status(201).json(formattedResponse);
    } catch (error) {
      console.error('Error creating public appointment:', error);
      return next(error);
    }
  }
);

// Protected routes
protectedRouter.use(requireAuth);
protectedRouter.use(requireBarber);

// Get all appointments
protectedRouter.get("/", getAppointments);

// Get last completed appointment for each client
protectedRouter.get("/last-completed", getLastCompletedAppointments);

// Get single appointment
protectedRouter.get("/:id", getAppointment);

// Create appointment (protected)
protectedRouter.post(
  "/",
  [
    body("clientId").notEmpty().withMessage("Client ID is required"),
    body("serviceId").notEmpty().withMessage("Service ID is required"),
    body("barberId").notEmpty().withMessage("Barber ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "completed", "cancelled"])
      .withMessage("Invalid status"),
    body("notes").optional(),
    validateRequest,
  ],
  createAppointment
);

// Update appointment
protectedRouter.put(
  "/:id",
  [
    body("clientId").optional().notEmpty().withMessage("Client ID cannot be empty"),
    body("serviceId").optional().notEmpty().withMessage("Service ID cannot be empty"),
    body("barberId").optional().notEmpty().withMessage("Barber ID cannot be empty"),
    body("date").optional().notEmpty().withMessage("Date cannot be empty"),
    body("time").optional().notEmpty().withMessage("Time cannot be empty"),
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "completed", "cancelled"])
      .withMessage("Invalid status"),
    body("notes").optional(),
    validateRequest,
  ],
  updateAppointment
);

// Delete appointment
protectedRouter.delete("/:id", deleteAppointment);

// Usar las rutas protegidas bajo la ruta base
router.use('/', protectedRouter);

export default router;
