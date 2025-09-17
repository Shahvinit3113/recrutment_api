import { Application } from "express";
import { config, isTest } from "@/core/config/environment";
import { logger } from "@/utils/logger";
import { container } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "@/db/connection/connection";

let server: import("http").Server | undefined;

export const startServer = async (app: Application): Promise<void> => {
  if (isTest) return;
  const port = config.PORT;
  server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`, { env: config.NODE_ENV });
  });
};

export const shutdown = async (signal: string): Promise<void> => {
  try {
    logger.warn(`Received ${signal}, shutting down gracefully...`);
    const db = container.get<DatabaseConnection>(TYPES.DatabaseConnection);
    await db.close();
    await new Promise<void>((resolve) => {
      if (!server) return resolve();
      server.close(() => resolve());
    });
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown", { err });
    process.exit(1);
  }
};

export const wireProcessHandlers = (): void => {
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception", { err });
    void shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", { reason });
    void shutdown("unhandledRejection");
  });
};
