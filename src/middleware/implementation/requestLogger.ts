import { logger } from "@/core/utils/logger.utils";
import { Request, Response, NextFunction } from "express";

/**
 * Enhanced middleware for logging HTTP requests with comprehensive metadata
 * Captures: method, path, IP, user agent, response time, status code, response size
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const metadata = {
      Method: req.method,
      Path: req.originalUrl,
      StatusCode: res.statusCode,
      ResponseTime: `${Math.round(durationMs * 100) / 100}ms`,
      TimeStamp: new Date().toUTCString(),
      UserAgent: req.get("user-agent"),
      IP: req.ip,
    };

    // Warn on slow requests (> 1 second)
    if (durationMs > 1000) {
      logger.warn("http_request_slow", {
        ...metadata,
      });
    } else if (durationMs > 500) {
      logger.info("http_request_moderate", metadata);
    } else {
      logger.info("http_request_fast", metadata);
    }
  });

  next();
};
