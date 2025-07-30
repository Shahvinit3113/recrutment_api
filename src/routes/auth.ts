import { Router } from "express";
import { AuthController } from "@/controllers/authController";
import { authMiddleware } from "@/middleware/auth";
import { validate, authValidation } from "@/middleware/validation";
import { asyncHandler } from "@/middleware/errorHandler";

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  "/register",
  validate(authValidation.register),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validate(authValidation.login),
  asyncHandler(authController.login)
);

router.post(
  "/refresh-token",
  validate(authValidation.refreshToken),
  asyncHandler(authController.refreshToken)
);

// Protected routes
router.post(
  "/change-password",
  authMiddleware.authenticate,
  validate(authValidation.changePassword),
  asyncHandler(authController.changePassword)
);

router.post(
  "/logout",
  authMiddleware.authenticate,
  asyncHandler(authController.logout)
);

router.get(
  "/profile",
  authMiddleware.authenticate,
  asyncHandler(authController.getProfile)
);

export default router;
