import { Router } from "express";
import { body } from "express-validator";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getCategories,
} from "../controllers/service.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router: Router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all services (accessible by all authenticated users)
router.get("/", getServices);

// Get all categories
router.get("/categories", getCategories);

// Get specific service (accessible by all authenticated users)
router.get("/:id", getService);

// Admin only routes
router.use(requireAdmin);

// Create service
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Service name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("duration")
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive number"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("categoryId")
      .optional()
      .isString()
      .withMessage("Category ID must be a string"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
  ],
  validateRequest,
  createService
);

// Update service
router.put(
  "/:id",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Service name cannot be empty"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("duration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive number"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
  ],
  validateRequest,
  updateService
);

// Toggle service status
router.patch("/:id/toggle-status", toggleServiceStatus);

// Delete service
router.delete("/:id", deleteService);

export { router as serviceRouter };
