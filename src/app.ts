import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { dbConnection } from "@/utils/database/connection";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import routes from "@/routes";

class App {
  public app: Application;
  public server: any;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.CORS_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDatabase();
    this.initializeSocketIO();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: config.CORS_ORIGINS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
        credentials: true,
        maxAge: 86400, // 24 hours
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests from this IP, please try again later.",
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use((req, res, next) => {
      const requestId =
        req.headers["x-request-id"] || Math.random().toString(36).substr(2, 9);
      req.headers["x-request-id"] = requestId as string;

      logger.info("Incoming request", {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use("/api/v1", routes);

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Gym Management API",
        version: "1.0.0",
        docs: "/api/v1/docs",
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const isConnected = await dbConnection.testConnection();
      if (isConnected) {
        logger.info("Database connected successfully");
      } else {
        logger.error("Database connection failed");
        process.exit(1);
      }
    } catch (error) {
      logger.error("Database initialization error:", error);
      process.exit(1);
    }
  }

  private initializeSocketIO(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on("join_room", (roomId: string) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("leave_room", (roomId: string) => {
        socket.leave(roomId);
        logger.info(`Socket ${socket.id} left room ${roomId}`);
      });

      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public listen(): void {
    this.server.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(
        `API Documentation: http://localhost:${config.PORT}/api/v1/docs`
      );
    });
  }

  public getServer() {
    return this.server;
  }

  public getSocketIO() {
    return this.io;
  }
}

export default App;

// Start the application
if (require.main === module) {
  const app = new App();
  app.listen();

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");

    try {
      await dbConnection.closePool();
      logger.info("Database connections closed");

      app.getServer().close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down gracefully");

    try {
      await dbConnection.closePool();
      logger.info("Database connections closed");

      app.getServer().close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
}
