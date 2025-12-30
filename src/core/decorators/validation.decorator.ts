import { ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { UseMiddleware } from "./middleware.decorator";
import { z, ZodSchema } from "zod";
import { formatZodErrors } from "@/core/utils/validation.utils";

/**
 * Decorator factory for validating request body data
 * @param validations Array of express-validator validation chains
 * @returns Method decorator that validates request body
 */
export function ValidateBody(validations: ValidationChain[]) {
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
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      next();
      return;
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

export function ValidateParams(validations: ValidationChain[]) {
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
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      next();
      return;
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

export function ValidateQuery(validations: ValidationChain[]) {
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
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      next();
      return;
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * ============================================================================
 * ZOD VALIDATION DECORATORS
 * ============================================================================
 */

/**
 * Validates request body using a Zod schema
 */
export function ValidateBodySchema(schema: ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formatZodErrors(result.error),
          });
        }
        // Replace body with validated data
        req.body = result.data;
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: [(error as Error).message],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * Validates request params using a Zod schema
 */
export function ValidateParamsSchema(schema: ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const result = schema.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formatZodErrors(result.error),
          });
        }
        req.params = result.data;
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: [(error as Error).message],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}

/**
 * Validates request query using a Zod schema
 */
export function ValidateQuerySchema(schema: ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const validationMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const result = schema.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formatZodErrors(result.error),
          });
        }
        req.query = result.data;
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: [(error as Error).message],
        });
      }
    };

    UseMiddleware(validationMiddleware)(target, propertyKey, descriptor);
  };
}
