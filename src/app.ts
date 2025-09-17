import "reflect-metadata";
import express, { Application } from "express";
import { registerRoutes } from "@/routes/index";
import { registerMiddleware } from "@/middleware/registerMiddleware";
import { notFound } from "@/middleware/notFound";
import { errorHandler } from "@/middleware/errorHandler";
import { startServer, wireProcessHandlers } from "@/server/index";

const app: Application = express();

// Security & core middleware
registerMiddleware(app);

// Routes
registerRoutes(app);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);
wireProcessHandlers();
void startServer(app);

export { app };
