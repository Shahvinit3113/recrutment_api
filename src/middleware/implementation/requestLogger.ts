import { logger } from "@/core/utils/logger.utils";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware for logging incoming HTTP requests
 * Logs request method, path, IP address, and timestamp
 *
 * @param req Express request object containing request details
 * @param _res Express response object (unused)
 * @param next Next middleware function
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logger.info("incoming_request", {
    Method: req.method,
    Path: req.originalUrl,
    IP: req.ip,
    TimeStamp: new Date(),
  });
  next();
};
