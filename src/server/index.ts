import { Application } from "express";
import { config, isTest } from "@/core/config/environment";
import { logger } from "@/core/utils/logger.utils";

let server: import("http").Server | undefined;

export const startServer = async (app: Application): Promise<void> => {
  if (isTest) return;
  const port = config.PORT;
  server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`, { env: config.NODE_ENV });
  });
};
