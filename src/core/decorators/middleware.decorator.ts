import { RequestHandler } from "express";
import {
  CONTROLLER_METADATA,
  getControllerMetadata,
} from "./controller.decorator";
import { getRouteMetadata } from "./route.decorator";
import { RouteDefinition } from "./types";

export function UseMiddleware(...middlewares: RequestHandler[]) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      // Method-level middleware
      const existingRoutes: RouteDefinition[] = getRouteMetadata(
        target.constructor
      );
      const route = existingRoutes.find((r) => r.methodName === propertyKey);

      if (route) {
        route.middlewares = [...route.middlewares, ...middlewares];
      }
    } else {
      // Class-level middleware
      const existingMetadata = getControllerMetadata(target) || {
        prefix: "",
        middlewares: [],
      };
      existingMetadata.middlewares = [
        ...existingMetadata.middlewares,
        ...middlewares,
      ];
      Reflect.defineMetadata(CONTROLLER_METADATA, existingMetadata, target);
    }
  };
}
