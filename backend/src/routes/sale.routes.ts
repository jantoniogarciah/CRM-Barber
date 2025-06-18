import { Router } from "express";
import { body } from "express-validator";
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} from "../controllers/sale.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all sales
router.get("/", getSales);

// Get specific sale
router.get("/:id", getSale);

// Create sale
router.post(
  "/",
  [
    body("clientId").notEmpty().withMessage("El cliente es requerido"),
    body("serviceId").notEmpty().withMessage("El servicio es requerido"),
    body("barberId").notEmpty().withMessage("El barbero es requerido"),
    body("amount").optional().isFloat().withMessage("El monto debe ser un número"),
    body("paymentMethod")
      .optional()
      .isIn(["EFECTIVO", "DEBITO", "CREDITO"])
      .withMessage("Método de pago inválido"),
    body("notes").optional().isString().withMessage("Las notas deben ser texto"),
    body("newClient").optional().isObject().withMessage("Los datos del nuevo cliente deben ser un objeto"),
    body("newClient.firstName").optional().isString().withMessage("El nombre debe ser texto"),
    body("newClient.lastName").optional().isString().withMessage("El apellido debe ser texto"),
    body("newClient.phone").optional().isString().withMessage("El teléfono debe ser texto"),
    body("newClient.email").optional().isEmail().withMessage("El email debe ser válido"),
    validateRequest,
  ],
  createSale
);

// Update sale
router.put(
  "/:id",
  [
    body("status")
      .optional()
      .isIn(["completed", "cancelled", "refunded"])
      .withMessage("Estado inválido"),
    body("paymentMethod")
      .optional()
      .isIn(["EFECTIVO", "DEBITO", "CREDITO"])
      .withMessage("Método de pago inválido"),
    body("notes").optional().isString().withMessage("Las notas deben ser texto"),
    validateRequest,
  ],
  updateSale
);

// Delete sale
router.delete("/:id", deleteSale);

export { router as saleRouter }; 