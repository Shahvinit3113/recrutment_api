import { NextFunction, Request, Response } from "express";

export type RouteMethods = "get" | "post" | "put" | "delete" | "patch";

export interface RouteDefinition {
  path: string;
  method: RouteMethods;
  methodName: string;
  middlewares: RequestHandler[];
}

export interface ControllerMetadata {
  prefix: string;
  middlewares: RequestHandler[];
}

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
