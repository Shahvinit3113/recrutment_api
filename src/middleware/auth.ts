import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/authService";
import { UserRepository } from "@/database/repositories/userRepository";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { UserType } from "@/types/user";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    userType: UserType;
  };
}

export class AuthMiddleware {
  private authService: AuthService;
  private userRepository: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepository = new UserRepository();
  }

  authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          ErrorCodes.UNAUTHORIZED,
          401,
          "Authorization token required"
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const payload = await this.authService.verifyToken(token);

      // Verify user still exists and is active
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new AppError(
          ErrorCodes.UNAUTHORIZED,
          401,
          "User account not found or inactive"
        );
      }

      // Attach user info to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        userType: payload.userType,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  authorize = (allowedUserTypes: UserType[]) => {
    return (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): void => {
      try {
        if (!req.user) {
          throw new AppError(
            ErrorCodes.UNAUTHORIZED,
            401,
            "Authentication required"
          );
        }

        if (!allowedUserTypes.includes(req.user.userType)) {
          throw new AppError(
            ErrorCodes.FORBIDDEN,
            403,
            "Insufficient permissions"
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  // Middleware for gym owners only
  gymOwnerOnly = this.authorize(["gym_owner"]);

  // Middleware for trainers only
  trainerOnly = this.authorize(["trainer"]);

  // Middleware for members only
  memberOnly = this.authorize(["member"]);

  // Middleware for trainers and gym owners
  trainerOrOwner = this.authorize(["trainer", "gym_owner"]);

  // Middleware for members and trainers
  memberOrTrainer = this.authorize(["member", "trainer"]);

  // Optional authentication (doesn't throw error if no token)
  optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = await this.authService.verifyToken(token);

        const user = await this.userRepository.findById(payload.userId);
        if (user && user.is_active) {
          req.user = {
            userId: payload.userId,
            email: payload.email,
            userType: payload.userType,
          };
        }
      }

      next();
    } catch (error) {
      // For optional auth, we don't throw errors, just continue without user
      next();
    }
  };
}

export const authMiddleware = new AuthMiddleware();
