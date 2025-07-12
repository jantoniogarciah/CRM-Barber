import { Router } from "express";
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

// Public route for creating appointments from the website
router.post(
  "/public",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    validateRequest,
  ],
  async (req, res) => {
    try {
      // Create a new client if doesn't exist
      const client = await prisma.client.upsert({
        where: { phone: req.body.phone },
        update: {
          name: req.body.name,
          email: req.body.email
        },
        create: {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email
        }
      });

      // Get default service and barber
      const service = await prisma.service.findFirst({
        where: { name: "Corte de cabello" }
      });

      const barber = await prisma.barber.findFirst();

      if (!service || !barber) {
        return res.status(500).json({ message: "Error: No se encontró servicio o barbero disponible" });
      }

      // Create the appointment
      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          barberId: barber.id,
          date: req.body.date,
          time: req.body.time,
          status: 'PENDING',
          notes: 'Cita creada desde la página web'
        }
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Error creating public appointment:', error);
      res.status(500).json({ message: 'Error al crear la cita' });
    }
  }
);

// Protected routes below this line
router.use(requireAuth);
router.use(requireBarber);

// Get all appointments
router.get("/", getAppointments);

// Get last completed appointment for each client
router.get("/last-completed", getLastCompletedAppointments);

// Get single appointment
router.get("/:id", getAppointment);

// Create appointment (protected)
router.post(
  "/",
  [
    body("clientId").notEmpty().withMessage("Client ID is required"),
    body("serviceId").notEmpty().withMessage("Service ID is required"),
    body("barberId").notEmpty().withMessage("Barber ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    body("notes").optional(),
    validateRequest,
  ],
  createAppointment
);

// Update appointment
router.put(
  "/:id",
  [
    body("clientId")
      .optional()
      .notEmpty()
      .withMessage("Client ID cannot be empty"),
    body("serviceId")
      .optional()
      .notEmpty()
      .withMessage("Service ID cannot be empty"),
    body("barberId")
      .optional()
      .notEmpty()
      .withMessage("Barber ID cannot be empty"),
    body("date")
      .optional()
      .notEmpty()
      .withMessage("Date cannot be empty"),
    body("time")
      .optional()
      .notEmpty()
      .withMessage("Time cannot be empty"),
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "completed", "cancelled"])
      .withMessage("Invalid status. Must be one of: pending, confirmed, completed, cancelled"),
    body("notes").optional(),
    validateRequest,
  ],
  updateAppointment
);

// Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
