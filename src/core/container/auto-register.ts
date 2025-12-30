import "reflect-metadata";
import { Container } from "inversify";

// Type for class constructor
type Newable<T> = new (...args: any[]) => T;

/**
 * ============================================================================
 * AUTO-REGISTRATION SYSTEM
 * ============================================================================
 *
 * This module provides decorators and utilities for automatic registration
 * of services and controllers in the Inversify container, eliminating the
 * need to manually add registrations in multiple places.
 *
 * USAGE:
 *
 * 1. Decorate your service class:
 *    @Service()
 *    export class UserService { ... }
 *
 * 2. Decorate your controller class:
 *    @AutoController("/users")
 *    export class UserController { ... }
 *
 * 3. In your container setup, call:
 *    autoRegister(container);
 *
 * That's it! No more manual registrations.
 */

// Metadata keys
const SERVICE_METADATA = Symbol("service:metadata");
const CONTROLLER_METADATA_AUTO = Symbol("controller:auto:metadata");

// Global registries
const serviceRegistry: Map<symbol, ServiceMetadata> = new Map();
const controllerRegistry: Map<symbol, ControllerAutoMetadata> = new Map();

/**
 * Service metadata
 */
interface ServiceMetadata {
  serviceClass: Newable<any>;
  identifier: symbol;
  scope: "singleton" | "request" | "transient";
  name: string;
}

/**
 * Controller metadata
 */
interface ControllerAutoMetadata {
  controllerClass: Newable<any>;
  identifier: symbol;
  prefix: string;
  name: string;
  middleware?: any[];
}

/**
 * Options for @Service decorator
 */
interface ServiceOptions {
  /** Custom identifier symbol (defaults to Symbol.for(ClassName)) */
  identifier?: symbol;
  /** Scope: singleton, request (per-request), or transient (new instance each time) */
  scope?: "singleton" | "request" | "transient";
}

/**
 * Options for @AutoController decorator
 */
interface ControllerOptions {
  /** Custom identifier symbol (defaults to class constructor) */
  identifier?: symbol;
  /** Middleware array to apply to all routes */
  middleware?: any[];
}

/**
 * ============================================================================
 * @Service DECORATOR
 * ============================================================================
 *
 * Marks a class as a service that should be auto-registered in the container.
 *
 * @param options - Optional configuration
 *
 * @example
 * // Basic usage (request scope by default)
 * @Service()
 * export class UserService { ... }
 *
 * // With custom scope
 * @Service({ scope: "singleton" })
 * export class CacheService { ... }
 *
 * // With custom identifier
 * @Service({ identifier: TYPES.MyService })
 * export class MyServiceImpl implements IMyService { ... }
 */
export function Service(options: ServiceOptions = {}) {
  return function <T extends Newable<any>>(target: T): T {
    const name = target.name;
    const identifier = options.identifier || Symbol.for(name);
    const scope = options.scope || "request";

    const metadata: ServiceMetadata = {
      serviceClass: target,
      identifier,
      scope,
      name,
    };

    // Store in class metadata
    Reflect.defineMetadata(SERVICE_METADATA, metadata, target);

    // Add to global registry
    serviceRegistry.set(identifier, metadata);

    return target;
  };
}

/**
 * ============================================================================
 * @AutoController DECORATOR
 * ============================================================================
 *
 * Marks a class as a controller that should be auto-registered and loaded.
 * This combines @controller and container registration into one decorator.
 *
 * @param prefix - Route prefix for this controller
 * @param middlewares - Optional array of middleware to apply to all routes
 * @param options - Optional configuration
 *
 * @example
 * @AutoController("/users", [authenticate])
 * export class UserController extends BaseController<...> { ... }
 */
export function AutoController(
  prefix: string,
  middlewares?: any[],
  options: ControllerOptions = {}
) {
  return function <T extends Newable<any>>(target: T): T {
    const name = target.name;
    // Use the class constructor itself as identifier (Inversify supports this)
    const identifier = options.identifier || Symbol.for(name);

    const metadata: ControllerAutoMetadata = {
      controllerClass: target,
      identifier,
      prefix: prefix.startsWith("/") ? prefix : `/${prefix}`,
      name,
      middleware: middlewares || [],
    };

    // Store in class metadata
    Reflect.defineMetadata(CONTROLLER_METADATA_AUTO, metadata, target);

    // Add to global registry
    controllerRegistry.set(identifier, metadata);

    // Also apply the @controller decorator from the old system
    // to maintain compatibility with RouteLoader
    const controllerDecorator = Reflect.getMetadata('controller', target.constructor) || {};
    Reflect.defineMetadata('controller', {
      ...controllerDecorator,
      prefix,
      middlewares: middlewares || []
    }, target);

    return target;
  };
}

/**
 * ============================================================================
 * AUTO-REGISTRATION FUNCTION
 * ============================================================================
 *
 * Registers all decorated services and controllers in the container.
 * Call this once during application startup.
 *
 * @param container - Inversify container to register in
 *
 * @example
 * import { Container } from "inversify";
 * import { autoRegister } from "@/core/container/auto-register";
 *
 * const container = new Container();
 * autoRegister(container);
 */
export function autoRegister(container: Container): void {
  // Register services
  for (const [identifier, metadata] of serviceRegistry) {
    const binding = container.bind(identifier).to(metadata.serviceClass);

    switch (metadata.scope) {
      case "singleton":
        binding.inSingletonScope();
        break;
      case "request":
        binding.inRequestScope();
        break;
      case "transient":
        binding.inTransientScope();
        break;
    }

    console.log(`  ✓ Service: ${metadata.name} (${metadata.scope})`);
  }

  // Register controllers
  for (const [_, metadata] of controllerRegistry) {
    container
      .bind(metadata.controllerClass)
      .to(metadata.controllerClass)
      .inRequestScope();

    console.log(`  ✓ Controller: ${metadata.name} -> ${metadata.prefix}`);
  }
}

/**
 * Get all registered controller classes
 * Use this to load routes automatically
 */
export function getRegisteredControllers(): Newable<any>[] {
  return Array.from(controllerRegistry.values()).map((m) => m.controllerClass);
}

/**
 * Get all registered service identifiers
 */
export function getRegisteredServices(): symbol[] {
  return Array.from(serviceRegistry.keys());
}

/**
 * Check if a service is registered
 */
export function isServiceRegistered(identifier: symbol): boolean {
  return serviceRegistry.has(identifier);
}

/**
 * Get service metadata
 */
export function getServiceMetadata(target: any): ServiceMetadata | undefined {
  return Reflect.getMetadata(SERVICE_METADATA, target);
}

/**
 * Get controller metadata
 */
export function getControllerAutoMetadata(
  target: any
): ControllerAutoMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA_AUTO, target);
}

/**
 * ============================================================================
 * DYNAMIC TYPES GENERATOR
 * ============================================================================
 *
 * Instead of manually maintaining TYPES object, you can generate it dynamically
 */
export function generateTypes(): Record<string, symbol> {
  const types: Record<string, symbol> = {};

  for (const [identifier, metadata] of serviceRegistry) {
    types[metadata.name] = identifier;
  }

  return types;
}
