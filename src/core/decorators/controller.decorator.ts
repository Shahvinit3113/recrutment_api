import "reflect-metadata";
import { RequestHandler, ControllerMetadata } from "./types";

export const CONTROLLER_METADATA = Symbol("controller");

export function controller(
  prefix: string = "",
  middlewares: RequestHandler[] = []
) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const controllerMetadata: ControllerMetadata = {
      prefix: prefix.startsWith("/") ? prefix : `/${prefix}`,
      middlewares,
    };

    Reflect.defineMetadata(
      CONTROLLER_METADATA,
      controllerMetadata,
      constructor
    );
    return constructor;
  };
}

export function getControllerMetadata(
  constructor: any
): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA, constructor);
}
