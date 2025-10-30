import { Router, RequestHandler } from "express";
import { getControllerMetadata } from "@/core/decorators/controller.decorator";
import { getRouteMetadata } from "@/core/decorators/route.decorator";
import { Container } from "inversify";
import { isPublicRoute } from "../decorators/public.decorator";
import { logger } from "../utils/logger.utils";

interface RouteInfo {
  method: string;
  path: string;
  handler: string;
  isPublic: boolean;
}

export class RouteLoader {
  private static routesByController: Map<string, RouteInfo[]> = new Map();

  static loadRoutes(
    router: Router,
    controllerClass: any,
    container: Container
  ): Router {
    const controllerMetadata = getControllerMetadata(controllerClass);
    const routeMetadata = getRouteMetadata(controllerClass);

    if (!controllerMetadata || !routeMetadata.length) {
      throw new Error(`No routes found for controller ${controllerClass.name}`);
    }

    const controllerInstance = container.get(controllerClass) as any;
    const basePath = controllerMetadata.prefix;
    const controllerName = controllerClass.name;

    // Initialize array for this controller
    if (!this.routesByController.has(controllerName)) {
      this.routesByController.set(controllerName, []);
    }

    // Register routes
    routeMetadata.forEach((route) => {
      const fullPath = basePath + route.path;

      // Check if route is marked as public
      const isPublic = isPublicRoute(controllerInstance, route.methodName);

      // Apply controller middlewares only if route is NOT public
      const controllerMiddlewares = isPublic
        ? []
        : controllerMetadata.middlewares;

      // Combine controller middlewares (if not public) + route-specific middlewares
      const middlewares: RequestHandler[] = [
        ...controllerMiddlewares,
        ...route.middlewares,
      ];

      const handler = async (req: any, res: any, next: any) => {
        try {
          req.container = container;
          await controllerInstance[route.methodName](req, res, next);
        } catch (error) {
          next(error);
        }
      };

      router[route.method](fullPath, ...middlewares, handler);

      // Store route info for grouped logging
      this.routesByController.get(controllerName)!.push({
        method: route.method.toUpperCase(),
        path: fullPath,
        handler: `${route.methodName}`,
        isPublic,
      });
    });

    return router;
  }

  static loadMultipleControllers(
    router: Router,
    controllers: any[],
    container: Container
  ): Router {
    controllers.forEach((controller) => {
      this.loadRoutes(router, controller, container);
    });

    // Log all routes in a structured way after loading
    this.logRegisteredRoutes();

    return router;
  }

  private static logRegisteredRoutes(): void {
    logger.info("=".repeat(80));
    logger.info("🚀 API ROUTES REGISTERED");
    logger.info("=".repeat(80));

    let totalRoutes = 0;
    let publicRoutes = 0;
    let protectedRoutes = 0;

    // Group controllers by base path for better organization
    const groupedControllers = this.groupControllersByPath();

    groupedControllers.forEach((controllers, group) => {
      if (group) {
        logger.info(`\n📁 ${group.toUpperCase()} ENDPOINTS`);
        logger.info("-".repeat(80));
      }

      controllers.forEach((controllerName) => {
        const routes = this.routesByController.get(controllerName) || [];

        // Sort routes by method and path for consistency
        const sortedRoutes = routes.sort((a, b) => {
          if (a.method !== b.method) {
            return (
              this.getMethodOrder(a.method) - this.getMethodOrder(b.method)
            );
          }
          return a.path.localeCompare(b.path);
        });

        sortedRoutes.forEach((route) => {
          const methodColor = this.getMethodColor(route.method);
          const accessBadge = route.isPublic ? "🔓 PUBLIC" : "🔒 PROTECTED";
          const methodPadded = route.method.padEnd(6);

          logger.info(
            `     ${methodColor} ${methodPadded} ${route.path.padEnd(30)} → ${
              route.handler
            } [${accessBadge}]`
          );

          totalRoutes++;
          if (route.isPublic) {
            publicRoutes++;
          } else {
            protectedRoutes++;
          }
        });
      });
    });

    // Summary
    logger.info("\n" + "=".repeat(80));
    logger.info("📊 SUMMARY");
    logger.info("-".repeat(80));
    logger.info(`   Total Routes: ${totalRoutes}`);
    logger.info(`   🔓 Public Routes: ${publicRoutes}`);
    logger.info(`   🔒 Protected Routes: ${protectedRoutes}`);
    logger.info(`   📦 Controllers: ${this.routesByController.size}`);
    logger.info("=".repeat(80) + "\n");
  }

  private static groupControllersByPath(): Map<string, string[]> {
    const grouped = new Map<string, string[]>();

    this.routesByController.forEach((routes, controllerName) => {
      if (routes.length === 0) return;

      // Extract base path from first route (e.g., /user, /task, /auth)
      const basePath = routes[0].path.split("/")[1] || "root";

      if (!grouped.has(basePath)) {
        grouped.set(basePath, []);
      }
      grouped.get(basePath)!.push(controllerName);
    });

    return grouped;
  }

  private static getMethodColor(method: string): string {
    const colors: { [key: string]: string } = {
      GET: "🟢",
      POST: "🟡",
      PUT: "🔵",
      PATCH: "🟣",
      DELETE: "🔴",
    };
    return colors[method] || "⚪";
  }

  private static getMethodOrder(method: string): number {
    const order: { [key: string]: number } = {
      GET: 1,
      POST: 2,
      PUT: 3,
      PATCH: 4,
      DELETE: 5,
    };
    return order[method] || 99;
  }
}
