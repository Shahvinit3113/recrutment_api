import { Router, RequestHandler } from "express";
import { getControllerMetadata } from "@/core/decorators/controller.decorator";
import { getRouteMetadata } from "@/core/decorators/route.decorator";
import { Container } from "inversify";
import { isPublicRoute } from "../decorators/public.decorator";

export class RouteLoader {
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

      const publicLabel = isPublic ? "[PUBLIC]" : "[PROTECTED]";
      console.log(
        `🚀 Route registered: ${route.method.toUpperCase()} ${fullPath} -> ${
          controllerClass.name
        }.${route.methodName} ${publicLabel}`
      );
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
    return router;
  }
}
