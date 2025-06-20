import { Router } from "express";
import { body } from "express-validator";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
  getClientByPhone,
  searchClientByPhone,
} from "../controllers/client.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";

const router: Router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all clients
router.get("/", getClients);

// Search client by phone
router.get("/search/phone", searchClientByPhone);

// Get specific client
router.get("/:id", getClient);

// Create client
router.post(
  "/",
  [
    body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
    body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("Email inválido")
      .normalizeEmail(),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("El teléfono es requerido")
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage("Formato de teléfono inválido"),
    body("notes").optional().trim(),
  ],
  validateRequest,
  createClient
);

// Update client
router.put(
  "/:id",
  [
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El apellido no puede estar vacío"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("Email inválido")
      .normalizeEmail(),
    body("phone")
      .optional()
      .trim()
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage("Formato de teléfono inválido"),
    body("notes").optional().trim(),
  ],
  validateRequest,
  updateClient
);

// Toggle client status
router.patch("/:id/toggle-status", toggleClientStatus);

// Delete client
router.delete("/:id", deleteClient);

export { router as clientRouter };
