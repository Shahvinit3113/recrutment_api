import { Request, Response, NextFunction, RequestHandler } from "express";
import { Container } from "inversify";

export const withController = <T>(
  token: string | symbol,
  handler: (
    controller: T,
    req: Request,
    res: Response,
    next: NextFunction
  ) => unknown
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestContainer = (req as any).container as Container;
      const controller = requestContainer.get<T>(token as any);
      return handler(controller, req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
