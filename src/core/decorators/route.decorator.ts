import { RequestHandler } from "express";
import { RouteDefinition, RouteMethods } from "./types";

export const ROUTES_METADATA = Symbol("routes");

/**
 * Creates a route decorator factory for a specific HTTP method
 * @param method The HTTP method to create a decorator for
 * @returns A decorator function that can be used to define routes
 */
function createRouteDecorator(method: RouteMethods) {
  /**
   * Route decorator function
   * @param path Optional URL path for the route
   * @param middlewares Optional array of middleware handlers
   * @param options Optional configuration for the route
   */
  return function (
    path: string = "",
    middlewares: RequestHandler[] = [],
    options?: { ignorePrefix?: boolean }
  ) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const ctor = target.constructor;

      // Check if this specific class has its own metadata storage
      // Use hasOwnMetadata to check only this class, not inherited
      if (!Reflect.hasOwnMetadata(ROUTES_METADATA, ctor)) {
        // Initialize with empty array for this specific class
        Reflect.defineMetadata(ROUTES_METADATA, [], ctor);
      }

      // Get only the routes defined on this specific class
      const routes: RouteDefinition[] = Reflect.getOwnMetadata(
        ROUTES_METADATA,
        ctor
      );

      routes.push({
        method: method as any,
        path: path.startsWith("/") ? path : `/${path}`,
        methodName: propertyKey,
        middlewares,
        ignorePrefix: options?.ignorePrefix || false, // Add flag to ignore controller prefix
      });

      // Store back on this specific class
      Reflect.defineMetadata(ROUTES_METADATA, routes, ctor);
    };
  };
}

export function getRouteMetadata(constructor: any): RouteDefinition[] {
  const ownRoutes = Reflect.getOwnMetadata(ROUTES_METADATA, constructor) || [];
  const parentRoutes = [];

  // Walk up the prototype chain to collect parent routes
  let parent = Object.getPrototypeOf(constructor);
  while (parent && parent.name) {
    const parentMeta = Reflect.getOwnMetadata(ROUTES_METADATA, parent);
    if (parentMeta) {
      parentRoutes.push(...parentMeta);
    }
    parent = Object.getPrototypeOf(parent);
  }

  // Return parent routes first, then child routes
  // This ensures base CRUD routes come first, then specific routes
  return [...parentRoutes, ...ownRoutes];
}

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Delete = createRouteDecorator("delete");
export const Patch = createRouteDecorator("patch");
