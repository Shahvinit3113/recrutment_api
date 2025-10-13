import { ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { UseMiddleware } from "./middleware.decorator";

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
