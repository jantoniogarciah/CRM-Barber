import { Router } from "express";
import { body } from "express-validator";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/category.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all categories (accessible by all authenticated users)
router.get("/", getCategories);

// Get specific category (accessible by all authenticated users)
router.get("/:id", getCategory);

// Create category (admin only)
router.post(
  "/",
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").optional().trim(),
  ],
  validateRequest,
  createCategory
);

// Update category (admin only)
router.put(
  "/:id",
  requireAdmin,
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("description").optional().trim(),
    body("isActive").optional().isBoolean(),
  ],
  validateRequest,
  updateCategory
);

// Delete category (admin only)
router.delete("/:id", requireAdmin, deleteCategory);

// Toggle category status (admin only)
router.patch("/:id/toggle-status", requireAdmin, toggleCategoryStatus);

export { router as categoryRouter };
