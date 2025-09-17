import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/helper/logger";

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logger.info("incoming_request", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
};
