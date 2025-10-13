import { RequestHandler } from "express";
import { RouteDefinition, RouteMethods } from "./types";

export const ROUTES_METADATA = Symbol("routes");

function createRouteDecorator(method: RouteMethods) {
  return function (path: string = "", middlewares: RequestHandler[] = []) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      if (!Reflect.hasMetadata(ROUTES_METADATA, target.constructor)) {
        Reflect.defineMetadata(ROUTES_METADATA, [], target.constructor);
      }

      const routes: RouteDefinition[] = Reflect.getMetadata(
        ROUTES_METADATA,
        target.constructor
      );

      routes.push({
        method: method as any,
        path: path.startsWith("/") ? path : `/${path}`,
        methodName: propertyKey,
        middlewares,
      });

      Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
    };
  };
}

export function getRouteMetadata(constructor: any): RouteDefinition[] {
  return Reflect.getMetadata(ROUTES_METADATA, constructor) || [];
}

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Delete = createRouteDecorator("delete");
export const Patch = createRouteDecorator("patch");
