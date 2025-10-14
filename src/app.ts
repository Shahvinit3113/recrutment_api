import "reflect-metadata";
import "@/core/container/container";
import express, { Application } from "express";
import { startServer } from "@/server/index";
import { registerMiddleware } from "./middleware/implementation/registerMiddleware";
import { errorHandler } from "./middleware/implementation/errorHandler";
import { initiControllersRoutes } from "./controllers";

const app: Application = express();

// Security & core middleware
registerMiddleware(app);

// Routes
// registerRoutes(app);

// 404 and error handler
// app.use(notFound);

app.use(errorHandler);
app.use("/api", initiControllersRoutes());
// wireProcessHandlers();
void startServer(app);

export { app };
