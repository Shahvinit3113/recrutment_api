import { Request, Response, NextFunction } from "express";
import { ErrorLoggingService } from "@/core/utils/error-logging.utils";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";
import { container } from "@/core/container/container";

/**
 * Enhanced error logging middleware with context extraction
 * @remarks Automatically captures request context and logs errors with full details
 */
export const errorLoggingMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Try to get user context from CallerService if available
    let userId: string | undefined;
    let orgId: string | undefined;

    try {
        const callerService = container.get<CallerService>(TYPES.Caller);
        userId = callerService.userId !== "Unknown" ? callerService.userId : undefined;
        orgId = callerService.tenantId;
    } catch {
        // CallerService not available or not authenticated request
    }

    // Extract context from request
    const context = ErrorLoggingService.extractContext(req, userId, orgId);

    // Log the error with full context
    ErrorLoggingService.logError(error, context);

    // Pass to next error handler
    next(error);
};
