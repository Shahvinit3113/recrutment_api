import "reflect-metadata";
import express, { Application } from "express";
import { registerRoutes } from "@/routes/index";
import { startServer, wireProcessHandlers } from "@/server/index";
import { registerMiddleware } from "./middleware/implementation/registerMiddleware";
import { notFound } from "./middleware/implementation/notFound";
import { errorHandler } from "./middleware/implementation/errorHandler";

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
