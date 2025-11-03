import { Request, Response, NextFunction } from "express";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";
import { UnAuthorizedError } from "../errors/unauthorized.error.";
import { JWT } from "@/core/utils/jwt.utils";
import { RequestHandler } from "@/core/decorators/types";
import { container } from "@/core/container/container";

/**
 * Authentication middleware that validates JWT tokens and sets up caller context
 * @param req Express request object containing authorization header with Bearer token
 * @param res Express response object
 * @param next Next middleware function
 * @throws UnAuthorizedError if token is missing, invalid, or expired
 * @remarks
 * - Extracts Bearer token from Authorization header
 * - Validates token using JWT utility
 * - Sets up caller context in CallerService
 * - Supports role-based access control
 */
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnAuthorizedError("Token is required");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // decode token
    const decodeResult = JWT.decode(token);

    if (!decodeResult.Valid) {
      throw new UnAuthorizedError("Invalid Access token");
    }

    if (decodeResult.Expired) {
      throw new UnAuthorizedError("Token Expired");
    }

    const user = decodeResult.Payload;

    const _callerService = container.get<CallerService>(TYPES.Caller);

    _callerService.setCaller({
      Role: user?.Role!,
      Email: user?.Email!,
      UserId: user?.UserId!,
      TenantId: user?.TenantId!,
    });

    next();
  } catch (error) {
    next(error);
  }
};
