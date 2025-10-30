import { RequestHandler } from "express";
import {
  CONTROLLER_METADATA,
  getControllerMetadata,
} from "./controller.decorator";
import { getRouteMetadata } from "./route.decorator";
import { RouteDefinition } from "./types";

/**
 * Decorator factory for applying middleware to controllers or routes
 * @param middlewares Array of Express middleware handlers to apply
 * @returns Decorator function that can be applied to classes or methods
 */
export function UseMiddleware(...middlewares: RequestHandler[]) {
  /**
   * Decorator implementation
   * @param target The class or method being decorated
   * @param propertyKey Optional method name when decorating a method
   * @param descriptor Optional method descriptor when decorating a method
   */
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
