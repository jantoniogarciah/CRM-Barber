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

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);
router.use(requireBarber);

// Get all appointments
router.get("/", getAppointments);

// Get last completed appointment for each client
router.get("/last-completed", getLastCompletedAppointments);

// Get single appointment
router.get("/:id", getAppointment);

// Create appointment
router.post(
  "/",
  [
    body("clientId").notEmpty().withMessage("Client ID is required"),
    body("serviceId").notEmpty().withMessage("Service ID is required"),
    body("barberId").notEmpty().withMessage("Barber ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("status")
      .isIn(["pending", "confirmed", "completed", "cancelled"])
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
router.delete("/:id", deleteAppointment);

export default router;
