import "reflect-metadata";
import "@/core/container/container";
import express, { Application } from "express";
import { startServer } from "@/server/index";
import { registerMiddleware } from "./middleware/implementation/registerMiddleware";
import { errorHandler } from "./middleware/implementation/errorHandler";
import { errorLoggingMiddleware } from "./middleware/implementation/errorLogging";
import { globalRateLimiter } from "./middleware/implementation/rateLimiter";
import { initiControllersRoutes } from "./controllers";

const app: Application = express();

// Security & core middleware
registerMiddleware(app);

// Global rate limiting (per-user based)
app.use(globalRateLimiter);

// Error logging middleware (before error handler)
app.use(errorLoggingMiddleware);

// Error handler (should be last)
app.use(errorHandler);

// API routes
app.use("/api", initiControllersRoutes());

void startServer(app);
