import "reflect-metadata";

export const PUBLIC_ROUTE = Symbol("public_route");

/**
 * Decorator to mark a route as public (excludes controller-level middlewares)
 */
export function Public() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(PUBLIC_ROUTE, true, target, propertyKey);
    return descriptor;
  };
}

/**
 * Check if a method is marked as public
 */
export function isPublicRoute(target: any, methodName: string): boolean {
  return Reflect.getMetadata(PUBLIC_ROUTE, target, methodName) === true;
}
