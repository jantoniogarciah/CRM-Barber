import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  register,
  getCurrentUser,
  updateUser,
} from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate-request";
import { requireAuth } from "../middleware/require-auth";

const router: Router = Router();

// Get current user (requires authentication)
router.get("/me", requireAuth, getCurrentUser);

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("role")
      .isIn(["ADMIN", "BARBER", "CLIENT"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.put(
  "/update",
  requireAuth,
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("phone")
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone must be 10 digits"),
  ],
  validateRequest,
  updateUser
);

export { router as authRouter };
