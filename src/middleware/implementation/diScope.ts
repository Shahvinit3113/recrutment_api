import { Request, Response, NextFunction } from "express";
import { container } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";

export const diScope = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Rebind request-specific services here
  // container
  //   .bind<CallerService>(TYPES.Caller)
  //   .to(CallerService)
  //   .inSingletonScope();

  next();
};
