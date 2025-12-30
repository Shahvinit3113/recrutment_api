import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import {
  requestContext,
  createDefaultContext,
  createAuthenticatedContext,
} from "@/core/context/request-context";
import { JWT } from "@/core/utils/jwt.utils";
import { UnAuthorizedError } from "../errors/unauthorized.error";
import { Role } from "@/data/enums/role";

/**
 * Request context middleware that wraps all requests in an AsyncLocalStorage context.
 * This must be the FIRST middleware in the chain to ensure all subsequent
 * code has access to the request context.
 *
 * For authenticated routes, it extracts user info from the JWT token.
 * For public routes, it creates a default anonymous context.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = randomUUID();

  // Attach requestId to request object for logging
  (req as any).requestId = requestId;

  // Create default context - will be upgraded to authenticated if token is valid
  const defaultCtx = createDefaultContext(requestId);

  // Run the rest of the middleware chain within the context
  requestContext.run(defaultCtx, () => {
    next();
  });
}

/**
 * Authentication middleware that validates JWT tokens and upgrades the request context.
 * Must be used AFTER requestContextMiddleware.
 *
 * @throws UnAuthorizedError if token is missing, invalid, or expired
 */
export function authenticateWithContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req as any).requestId || randomUUID();

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnAuthorizedError("Token is required");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode token
    const decodeResult = JWT.decode(token);

    if (!decodeResult.Valid) {
      throw new UnAuthorizedError("Invalid Access token");
    }

    if (decodeResult.Expired) {
      throw new UnAuthorizedError("Token Expired");
    }

    const user = decodeResult.Payload;

    if (!user) {
      throw new UnAuthorizedError("Invalid Access token");
    }

    // Create authenticated context
    const authenticatedCtx = createAuthenticatedContext(
      user.UserId!,
      user.Email!,
      user.Role as Role,
      user.TenantId!,
      user.InfoId || "0000",
      requestId
    );

    // Run the rest of the middleware chain within the authenticated context
    requestContext.run(authenticatedCtx, () => {
      next();
    });
  } catch (error) {
    next(error);
  }
}
