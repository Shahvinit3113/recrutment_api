import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/AuthService";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { logger } from "@/utils/logger";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        email,
        password,
        user_type,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
      } = req.body;

      // Validate required fields
      if (!email || !password || !user_type || !first_name || !last_name) {
        throw new AppError(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          400,
          "Missing required fields"
        );
      }

      const result = await this.authService.register({
        email: email.toLowerCase().trim(),
        password,
        user_type,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: phone?.trim(),
        date_of_birth,
        gender,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          400,
          "Email and password are required"
        );
      }

      const result = await this.authService.login({
        email: email.toLowerCase().trim(),
        password,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          400,
          "Refresh token is required"
        );
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user?.userId;

      if (!currentPassword || !newPassword) {
        throw new AppError(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          400,
          "Current password and new password are required"
        );
      }

      await this.authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // In a more advanced implementation, you would invalidate the token
      // For now, we'll just return a success response
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      // This would typically call a UserService to get full profile
      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: (req as any).user,
      });
    } catch (error) {
      next(error);
    }
  };
}
