import { Request, Response, NextFunction } from "express";
import { container } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";

/**
 * Alternative approach: Decorator that ensures CallerService is initialized
 * Can be used at method level for more granular control
 *
 * @example
 * ```typescript
 * @EnsureCaller()
 * @Public()
 * @Post("/submit")
 * async submitApplication(req: Request, res: Response) {
 *   // CallerService is guaranteed to be initialized
 * }
 * ```
 */
export function EnsureCaller() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next?: NextFunction,
    ) {
      try {
        const callerService = container.get<CallerService>(TYPES.Caller);

        // Initialize anonymous caller if not already set
        if (!callerService.isAuthenticated) {
          callerService.setAnonymousCaller();
        }

        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        if (next) {
          next(error);
        } else {
          throw error;
        }
      }
    };

    return descriptor;
  };
}
