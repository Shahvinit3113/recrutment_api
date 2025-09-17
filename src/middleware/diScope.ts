import { Request, Response, NextFunction } from "express";
import { Container } from "inversify";
import { container as rootContainer } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { CallerService } from "@/service/caller/caller.service";

export const diScope = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const requestContainer = new Container({ defaultScope: "Singleton" });
  (requestContainer as any).parent = rootContainer;

  // Rebind request-specific services here
  requestContainer
    .bind<CallerService>(TYPES.Caller)
    .to(CallerService)
    .inSingletonScope();

  (req as any).container = requestContainer;
  next();
};
