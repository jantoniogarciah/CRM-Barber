import { Router } from "express";
import { body } from "express-validator";
import {
  createBarber,
  getBarbers,
  getBarber,
  updateBarber,
  deleteBarber,
  toggleBarberStatus,
} from "../controllers/barber.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Get all barbers
router.get("/", getBarbers);

// Get specific barber
router.get("/:id", getBarber);

// Create barber
router.post(
  "/",
  [
    body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
    body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
    body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("Email inválido")
      .normalizeEmail(),
    body("instagram").optional({ values: "falsy" }).trim(),
  ],
  validateRequest,
  createBarber
);

// Update barber
router.put(
  "/:id",
  [
    body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
    body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
    body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("Email inválido")
      .normalizeEmail(),
    body("instagram").optional({ values: "falsy" }).trim(),
  ],
  validateRequest,
  updateBarber
);

// Toggle barber status
router.patch("/:id/toggle-status", toggleBarberStatus);

// Delete barber
router.delete("/:id", deleteBarber);

export { router as barberRouter };
