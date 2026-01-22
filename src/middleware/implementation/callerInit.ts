import { Request, Response, NextFunction } from "express";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";
import { RequestHandler } from "@/core/decorators/types";
import { container } from "@/core/container/container";

/**
 * Middleware that ensures CallerService is always initialized
 * This middleware runs before authentication and sets up a default "anonymous" caller
 * If authentication is successful, the authenticate middleware will override these values
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 *
 * @remarks
 * - Always initializes CallerService with default/anonymous values
 * - Prevents undefined caller errors in public routes
 * - Safe to use alongside authentication middleware
 */
export const initializeCaller: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const _callerService = container.get<CallerService>(TYPES.Caller);

    // Initialize with anonymous/public caller
    // This will be overridden by authenticate middleware if authentication is present
    _callerService.setAnonymousCaller();

    next();
  } catch (error) {
    next(error);
  }
};
