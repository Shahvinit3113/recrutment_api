import { Application } from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import express from "express";
import { corsOptions } from "@/core/config/cors";
import { config } from "@/core/config/environment";
import { requestLogger } from "./requestLogger";
import { diScope } from "./diScope";

export const registerMiddleware = (app: Application): void => {
  app.use(helmet());
  app.use(compression());
  // app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: `${Math.ceil(config.MAX_FILE_SIZE / 1024 / 1024)}mb`,
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(diScope);
  app.use(
    rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
};
