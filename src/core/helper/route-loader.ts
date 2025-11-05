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
  controllerName: string;
}

export class RouteLoader {
  private static allRoutes: RouteInfo[] = [];

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

    // Register routes
    routeMetadata.forEach((route) => {
      // Check if route should ignore controller prefix
      const fullPath = route.ignorePrefix
        ? route.path // Use path directly without prefix
        : basePath + route.path; // Use prefix + path

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

      // Store route info - only if not already registered
      const routeKey = `${route.method.toUpperCase()}:${fullPath}`;
      const existingRoute = this.allRoutes.find(
        (r) => `${r.method}:${r.path}` === routeKey
      );

      if (!existingRoute) {
        this.allRoutes.push({
          method: route.method.toUpperCase(),
          path: fullPath,
          handler: route.methodName,
          isPublic,
          controllerName,
        });
      }
    });

    return router;
  }

  static loadMultipleControllers(
    router: Router,
    controllers: any[],
    container: Container
  ): Router {
    // Clear previous routes
    this.allRoutes = [];

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

    // Group routes by their base path
    const groupedRoutes = new Map<string, RouteInfo[]>();

    this.allRoutes.forEach((route) => {
      // Extract base path (e.g., /user/profile -> user)
      const pathParts = route.path.split("/").filter((p) => p.length > 0);
      const basePath = pathParts[0] || "root";

      if (!groupedRoutes.has(basePath)) {
        groupedRoutes.set(basePath, []);
      }
      groupedRoutes.get(basePath)!.push(route);
    });

    // Sort groups alphabetically
    const sortedGroups = Array.from(groupedRoutes.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    sortedGroups.forEach(([group, routes]) => {
      logger.info(`\n📁 ${group.toUpperCase()} ENDPOINTS`);
      logger.info("-".repeat(80));

      // Sort routes within group: by method order, then by path
      const sortedRoutes = routes.sort((a, b) => {
        if (a.method !== b.method) {
          return this.getMethodOrder(a.method) - this.getMethodOrder(b.method);
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

    // Summary
    logger.info("\n" + "=".repeat(80));
    logger.info("📊 SUMMARY");
    logger.info("-".repeat(80));
    logger.info(`   Total Routes: ${totalRoutes}`);
    logger.info(`   🔓 Public Routes: ${publicRoutes}`);
    logger.info(`   🔒 Protected Routes: ${protectedRoutes}`);
    logger.info(`   📦 Controllers: ${groupedRoutes.size}`);
    logger.info("=".repeat(80) + "\n");
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
