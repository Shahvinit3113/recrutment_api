import { ErrorCodes } from './errorCodes';
import { ERROR_MESSAGES } from './errorMessages';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCodes;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    errorCode: ErrorCodes,
    statusCode: number = 500,
    message?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    const errorMessage = message || ERROR_MESSAGES[errorCode];
    super(errorMessage);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }

  // Static factory methods for common errors
  static unauthorized(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.UNAUTHORIZED, 401, message, details);
  }

  static forbidden(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.FORBIDDEN, 403, message, details);
  }

  static notFound(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.RECORD_NOT_FOUND, 404, message, details);
  }

  static validation(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.VALIDATION_ERROR, 400, message, details);
  }

  static conflict(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.RESOURCE_CONFLICT, 409, message, details);
  }

  static internal(message?: string, details?: any): AppError {
    return new AppError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, message, details, false);
  }
}