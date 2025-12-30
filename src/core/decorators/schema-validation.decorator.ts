import { z, ZodType, ZodError, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";
import { UseMiddleware } from "./middleware.decorator";
import { Response as ApiResponse } from "@/data/response/response";

/**
 * ============================================================================
 * ZOD-BASED VALIDATION DECORATORS
 * ============================================================================
 *
 * These decorators provide type-safe request validation using Zod schemas.
 * Benefits over express-validator:
 * - Full TypeScript inference
 * - Reusable schema definitions
 * - Better error messages
 * - Transform and default values
 *
 * @example
 * // Define a schema
 * const CreateUserSchema = z.object({
 *   name: z.string().min(2).max(100),
 *   email: z.string().email(),
 *   age: z.number().int().min(18).optional(),
 * });
 *
 * // Use in controller
 * @ValidateBodySchema(CreateUserSchema)
 * async create(req: BodyRequest<z.infer<typeof CreateUserSchema>>, res: Response) {
 *   // req.body is fully typed and validated
 * }
 */

/**
 * Validation error response structure
 */
export interface ValidationErrorResponse {
  success: false;
  status: 400;
  message: string;
  errors: ValidationFieldError[];
}

export interface ValidationFieldError {
  field: string;
  message: string;
  code: string;
}

/**
 * Format Zod errors into a consistent structure
 */
function formatZodErrors(error: ZodError): ValidationFieldError[] {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Create validation error response
 */
function createValidationErrorResponse(
  res: Response,
  errors: ValidationFieldError[]
): Response {
  const response: ValidationErrorResponse = {
    success: false,
    status: 400,
    message: "Validation failed",
    errors,
  };
  return res.status(400).json(response);
}

/**
 * Validate request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Method decorator
 *
 * @example
 * const CreateUserSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 * });
 *
 * @ValidateBodySchema(CreateUserSchema)
 * async create(req: BodyRequest<z.infer<typeof CreateUserSchema>>, res: Response) {
 *   const { name, email } = req.body; // Fully typed!
 * }
 */
export function ValidateBodySchema<T extends ZodType>(schema: T) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Parse and transform the body
        const result = schema.safeParse(req.body);

        if (!result.success) {
          return createValidationErrorResponse(
            res,
            formatZodErrors(result.error)
          );
        }

        // Replace body with parsed/transformed data
        req.body = result.data;
        next();
        return;
      } catch (error) {
        return res.status(500).json({
          success: false,
          status: 500,
          message: "Validation error",
          errors: [
            {
              field: "unknown",
              message: "An unexpected error occurred",
              code: "internal",
            },
          ],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * Validate request params against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Method decorator
 *
 * @example
 * const IdParamSchema = z.object({
 *   id: z.string().uuid(),
 * });
 *
 * @ValidateParamsSchema(IdParamSchema)
 * async getById(req: ParamsRequest<z.infer<typeof IdParamSchema>>, res: Response) {
 *   const { id } = req.params; // Validated UUID
 * }
 */
export function ValidateParamsSchema<T extends ZodType>(schema: T) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const result = schema.safeParse(req.params);

        if (!result.success) {
          return createValidationErrorResponse(
            res,
            formatZodErrors(result.error)
          );
        }

        // Replace params with parsed/transformed data
        (req as any).params = result.data;
        next();
        return;
      } catch (error) {
        return res.status(500).json({
          success: false,
          status: 500,
          message: "Validation error",
          errors: [
            {
              field: "unknown",
              message: "An unexpected error occurred",
              code: "internal",
            },
          ],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * Validate request query against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Method decorator
 *
 * @example
 * const SearchQuerySchema = z.object({
 *   page: z.coerce.number().int().min(1).default(1),
 *   limit: z.coerce.number().int().min(1).max(100).default(10),
 *   search: z.string().optional(),
 * });
 *
 * @ValidateQuerySchema(SearchQuerySchema)
 * async search(req: QueryRequest<z.infer<typeof SearchQuerySchema>>, res: Response) {
 *   const { page, limit, search } = req.query; // Typed with defaults applied
 * }
 */
export function ValidateQuerySchema<T extends ZodType>(schema: T) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const result = schema.safeParse(req.query);

        if (!result.success) {
          return createValidationErrorResponse(
            res,
            formatZodErrors(result.error)
          );
        }

        // Replace query with parsed/transformed data
        (req as any).query = result.data;
        next();
        return;
      } catch (error) {
        return res.status(500).json({
          success: false,
          status: 500,
          message: "Validation error",
          errors: [
            {
              field: "unknown",
              message: "An unexpected error occurred",
              code: "internal",
            },
          ],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * Combined validation for body, params, and query
 *
 * @param config - Object containing optional schemas for body, params, and query
 * @returns Method decorator
 *
 * @example
 * @Validate({
 *   params: z.object({ id: z.string().uuid() }),
 *   body: z.object({ name: z.string() }),
 *   query: z.object({ include: z.string().optional() }),
 * })
 * async update(req: Request, res: Response) { }
 */
export function Validate<
  TBody extends ZodType = ZodType<any>,
  TParams extends ZodType = ZodType<any>,
  TQuery extends ZodType = ZodType<any>
>(config: { body?: TBody; params?: TParams; query?: TQuery }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const allErrors: ValidationFieldError[] = [];

      try {
        // Validate params
        if (config.params) {
          const result = config.params.safeParse(req.params);
          if (!result.success) {
            allErrors.push(
              ...formatZodErrors(result.error).map((e) => ({
                ...e,
                field: `params.${e.field}`,
              }))
            );
          } else {
            (req as any).params = result.data;
          }
        }

        // Validate body
        if (config.body) {
          const result = config.body.safeParse(req.body);
          if (!result.success) {
            allErrors.push(
              ...formatZodErrors(result.error).map((e) => ({
                ...e,
                field: `body.${e.field}`,
              }))
            );
          } else {
            req.body = result.data;
          }
        }

        // Validate query
        if (config.query) {
          const result = config.query.safeParse(req.query);
          if (!result.success) {
            allErrors.push(
              ...formatZodErrors(result.error).map((e) => ({
                ...e,
                field: `query.${e.field}`,
              }))
            );
          } else {
            (req as any).query = result.data;
          }
        }

        if (allErrors.length > 0) {
          return createValidationErrorResponse(res, allErrors);
        }

        next();
        return;
      } catch (error) {
        return res.status(500).json({
          success: false,
          status: 500,
          message: "Validation error",
          errors: [
            {
              field: "unknown",
              message: "An unexpected error occurred",
              code: "internal",
            },
          ],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}
