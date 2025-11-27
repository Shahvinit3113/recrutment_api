import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { config } from "@/core/config/environment";

/**
 * Extract user identifier from request for rate limiting
 * @param req Express request
 * @returns User identifier (userId, email, or IP)
 */
const getUserIdentifier = (req: Request): string => {
    // Try to get user ID from authenticated request
    if (req.body?.userId) {
        return `user:${req.body.userId}`;
    }

    // Try to get email from request body (login/register)
    if (req.body?.email || req.body?.Email) {
        return `email:${req.body.email || req.body.Email}`;
    }

    // Fallback to IP address
    return `ip:${req.ip}`;
};

/**
 * Global API rate limiter - applies to all API endpoints
 * @remarks Prevents API abuse from a single source
 */
export const globalRateLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getUserIdentifier(req),
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "Too many requests, please try again later.",
        Model: null,
    },
});

/**
 * Authentication endpoints rate limiter (stricter)
 * @remarks Prevents brute force attacks on login/register
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use email for auth endpoints
        const email = req.body?.email || req.body?.Email;
        return email ? `auth:email:${email}` : `auth:ip:${req.ip}`;
    },
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "Too many authentication attempts. Please try again after 15 minutes.",
        Model: null,
    },
    skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Account creation rate limiter (very strict)
 * @remarks Prevents spam account creation
 */
export const createAccountRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 accounts per hour from same source
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email || req.body?.Email;
        return email ? `create:email:${email}` : `create:ip:${req.ip}`;
    },
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "Account creation limit reached. Please try again later.",
        Model: null,
    },
});

/**
 * Data modification rate limiter (moderate)
 * @remarks Protects against rapid-fire modifications
 */
export const modificationRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 modifications per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getUserIdentifier(req),
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "Too many modifications. Please slow down.",
        Model: null,
    },
});

/**
 * Bulk operations rate limiter (strictest)
 * @remarks Prevents database overload from bulk operations
 */
export const bulkOperationRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 bulk operations per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getUserIdentifier(req),
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "Bulk operation limit reached. Please wait before trying again.",
        Model: null,
    },
});

/**
 * File upload rate limiter
 * @remarks Prevents excessive file uploads
 */
export const fileUploadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getUserIdentifier(req),
    message: {
        IsSuccess: false,
        Status: 429,
        Message: "File upload limit reached. Please try again later.",
        Model: null,
    },
});
