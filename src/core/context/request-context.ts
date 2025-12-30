import { AsyncLocalStorage } from "async_hooks";
import { Role } from "@/data/enums/role";

/**
 * Request-scoped context data that is safely isolated per request
 * using AsyncLocalStorage to prevent race conditions
 */
export interface RequestContextData {
  userId: string;
  email: string;
  role: Role;
  tenantId: string;
  infoId: string;
  requestId: string;
  startTime: number;
}

/**
 * AsyncLocalStorage-based request context manager
 * This replaces the problematic singleton CallerService pattern
 * and provides thread-safe request-scoped data isolation
 */
class RequestContextManager {
  private storage = new AsyncLocalStorage<RequestContextData>();

  /**
   * Run a callback within a new request context
   * All code executed within the callback will have access to this context
   */
  run<T>(context: RequestContextData, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * Get the current request context
   * Returns undefined if called outside of a request context
   */
  getContext(): RequestContextData | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current request context or throw an error
   * Use this when you expect to always be within a request context
   */
  getContextOrThrow(): RequestContextData {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error(
        "No request context available. This code must be called within a request handler."
      );
    }
    return context;
  }

  /**
   * Check if we're currently within a request context
   */
  hasContext(): boolean {
    return this.storage.getStore() !== undefined;
  }

  // Convenience getters for common properties
  get userId(): string {
    return this.getContextOrThrow().userId;
  }

  get email(): string {
    return this.getContextOrThrow().email;
  }

  get role(): Role {
    return this.getContextOrThrow().role;
  }

  get tenantId(): string {
    return this.getContextOrThrow().tenantId;
  }

  get infoId(): string {
    return this.getContextOrThrow().infoId;
  }

  get requestId(): string {
    return this.getContextOrThrow().requestId;
  }
}

// Export a singleton instance - safe because AsyncLocalStorage handles isolation
export const requestContext = new RequestContextManager();

/**
 * Creates default context for unauthenticated requests
 */
export function createDefaultContext(requestId: string): RequestContextData {
  return {
    userId: "0000",
    email: "",
    role: Role.Employee,
    tenantId: "0000",
    infoId: "0000",
    requestId,
    startTime: Date.now(),
  };
}

/**
 * Creates context from authenticated user data
 */
export function createAuthenticatedContext(
  userId: string,
  email: string,
  role: Role,
  tenantId: string,
  infoId: string,
  requestId: string
): RequestContextData {
  return {
    userId,
    email,
    role,
    tenantId,
    infoId,
    requestId,
    startTime: Date.now(),
  };
}
