import { RouteLoader } from "@/core/helper/route-loader";
import { Router } from "express";
import { container } from "@/core/container/container";
import { getRegisteredControllers } from "@/core/container/auto-register";

export function initiControllersRoutes() {
  const router = Router();
  
  // Auto-discover all controllers decorated with @AutoController
  const controllers = getRegisteredControllers();
  
  RouteLoader.loadMultipleControllers(router, controllers, container);

  return router;
}
