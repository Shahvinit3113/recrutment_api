import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { logger } from "@/utils/logger";
import { config } from "@/config/environment";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    stack?: string;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let message = "An unexpected error occurred";
  let details: any = undefined;

  // Generate request ID for tracking
  const requestId =
    (req.headers["x-request-id"] as string) || generateRequestId();

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
    details = error.details;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = error.message;
  } else if (error.name === "CastError") {
    statusCode = 400;
    errorCode = ErrorCodes.INVALID_INPUT;
    message = "Invalid input format";
  } else if (error.name === "MongoError" || error.name === "MongoServerError") {
    statusCode = 500;
    errorCode = ErrorCodes.DATABASE_ERROR;
    message = "Database operation failed";
  }

  // Log error
  logger.error("Request error:", {
    requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      errorCode,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId,
      ...(config.NODE_ENV === "development" && { stack: error.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    ErrorCodes.RECORD_NOT_FOUND,
    404,
    `Route ${req.method} ${req.path} not found`
  );
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
