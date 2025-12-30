import { injectable } from "inversify";
import { Caller } from "./caller";
import { Role } from "@/data/enums/role";
import {
  requestContext,
  RequestContextData,
} from "@/core/context/request-context";

/**
 * CallerService provides access to the current request's user context.
 *
 * This service now uses AsyncLocalStorage internally via requestContext
 * to provide thread-safe, request-scoped data isolation.
 *
 * @deprecated Direct usage is supported for backward compatibility.
 * Consider using `requestContext` directly for new code.
 */
@injectable()
export class CallerService {
  /**
   * @deprecated Use requestContext middleware instead.
   * This method is kept for backward compatibility.
   */
  setCaller(caller: Caller) {
    // This is now a no-op as context is set via middleware
    // The actual context is managed by requestContext via AsyncLocalStorage
    console.warn(
      "CallerService.setCaller is deprecated. Context is now managed by requestContext middleware."
    );
  }

  /**
   * @deprecated Use requestContext middleware instead.
   */
  setUnknownCaller() {
    console.warn(
      "CallerService.setUnknownCaller is deprecated. Context is now managed by requestContext middleware."
    );
  }

  get userId(): string {
    return requestContext.hasContext() ? requestContext.userId : "0000";
  }

  get role(): Role {
    return requestContext.hasContext() ? requestContext.role : Role.Employee;
  }

  get mail(): string {
    return requestContext.hasContext() ? requestContext.email : "";
  }

  get tenantId(): string {
    return requestContext.hasContext() ? requestContext.tenantId : "0000";
  }

  get _caller(): Caller {
    if (!requestContext.hasContext()) {
      return new Caller({
        Email: "",
        Role: Role.Employee,
        UserId: "0000",
        TenantId: "0000",
        InfoId: "0000",
      });
    }

    const ctx = requestContext.getContextOrThrow();
    return new Caller({
      Email: ctx.email,
      Role: ctx.role,
      UserId: ctx.userId,
      TenantId: ctx.tenantId,
      InfoId: ctx.infoId,
    });
  }

  get infoId(): string {
    return requestContext.hasContext() ? requestContext.infoId : "0000";
  }

  /**
   * Get the full request context data
   * Provides access to additional request metadata like requestId and startTime
   */
  get context(): RequestContextData | undefined {
    return requestContext.getContext();
  }
}
