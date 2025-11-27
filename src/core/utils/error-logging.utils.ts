import { logger } from "./logger.utils";
import type { Request } from "express";

/**
 * Context information for error logging
 */
export interface ErrorContext {
    /**
     * User ID who triggered the error
     */
    userId?: string;

    /**
     * Organization ID context
     */
    orgId?: string;

    /**
     * Request path that caused the error
     */
    path?: string;

    /**
     * HTTP method
     */
    method?: string;

    /**
     * Request body (sanitized)
     */
    body?: any;

    /**
     * Query parameters
     */
    query?: any;

    /**
     * Request headers (sanitized)
     */
    headers?: Record<string, any>;

    /**
     * Additional custom context
     */
    metadata?: Record<string, any>;
}

/**
 * Service for enhanced error logging with context
 */
export class ErrorLoggingService {
    /**
     * Sensitive fields to exclude from logging
     */
    private static readonly SENSITIVE_FIELDS = [
        "password",
        "token",
        "authorization",
        "secret",
        "apikey",
        "api-key",
        "api_key",
    ];

    /**
     * Sanitize an object by removing sensitive fields
     * @param obj Object to sanitize
     * @returns Sanitized object
     */
    private static sanitize(obj: any): any {
        if (!obj || typeof obj !== "object") {
            return obj;
        }

        const sanitized: any = Array.isArray(obj) ? [] : {};

        for (const [key, value] of Object.entries(obj)) {
            const keyLower = key.toLowerCase();
            const isSensitive = this.SENSITIVE_FIELDS.some((field) =>
                keyLower.includes(field)
            );

            if (isSensitive) {
                sanitized[key] = "***REDACTED***";
            } else if (typeof value === "object" && value !== null) {
                sanitized[key] = this.sanitize(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Extract error context from Express request
     * @param req Express request object
     * @param userId Optional user ID
     * @param orgId Optional organization ID
     * @returns Error context
     */
    static extractContext(
        req: Request,
        userId?: string,
        orgId?: string
    ): ErrorContext {
        return {
            userId,
            orgId,
            path: req.path,
            method: req.method,
            body: this.sanitize(req.body),
            query: this.sanitize(req.query),
            headers: this.sanitize({
                "user-agent": req.headers["user-agent"],
                "content-type": req.headers["content-type"],
                referer: req.headers.referer,
            }),
        };
    }

    /**
     * Log error with full context
     * @param error Error object
     * @param context Error context
     * @param level Log level
     */
    static logError(
        error: Error,
        context: ErrorContext,
        level: "error" | "warn" = "error"
    ): void {
        const logData = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            context: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        };

        if (level === "error") {
            logger.error("Application Error", logData);
        } else {
            logger.warn("Application Warning", logData);
        }
    }

    /**
     * Log validation error with context
     * @param message Validation error message
     * @param context Error context
     * @param validationDetails Additional validation details
     */
    static logValidationError(
        message: string,
        context: ErrorContext,
        validationDetails?: any
    ): void {
        logger.warn("Validation Error", {
            message,
            validationDetails: this.sanitize(validationDetails),
            context: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        });
    }

    /**
     * Log authentication/authorization error
     * @param message Auth error message
     * @param context Error context
     */
    static logAuthError(message: string, context: ErrorContext): void {
        logger.warn("Authentication/Authorization Error", {
            message,
            context: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        });
    }

    /**
     * Log database error with query context
     * @param error Error object
     * @param query SQL query that failed
     * @param params Query parameters
     * @param context Additional context
     */
    static logDatabaseError(
        error: Error,
        query?: string,
        params?: any[],
        context?: ErrorContext
    ): void {
        logger.error("Database Error", {
            message: error.message,
            stack: error.stack,
            query: query?.substring(0, 200), // Limit query length
            paramsCount: params?.length,
            context: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        });
    }

    /**
     * Log slow query warning
     * @param query SQL query
     * @param duration Query duration in ms
     * @param context Additional context
     */
    static logSlowQuery(query: string, duration: number, context?: ErrorContext): void {
        logger.warn("Slow Query Detected", {
            query: query.substring(0, 200),
            durationMs: duration,
            context: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        });
    }
}
