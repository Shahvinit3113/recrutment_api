import { Request, Response, NextFunction } from "express";
import { Response as AppResponse } from "@/data/response/response";
import { InternalServerError } from "../errors/internalServer.error";
import { UnAuthorizedError } from "../errors/unauthorized.error.";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/notFound.error";
import { UnknownError } from "../errors/unknown.error";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let status: number;
  let message: string;

  if (error instanceof ValidationError) {
    status = error.StatusCode;
    message = error.message;
  } else if (error instanceof InternalServerError) {
    status = error.StatusCode;
    message = error.message;
  } else if (error instanceof UnAuthorizedError) {
    status = error.StatusCode;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    status = error.StatusCode;
    message = error.message;
  } else if (error instanceof UnknownError) {
    status = error.StatusCode;
    message = error.message;
  } else {
    status = 500;
    message = "Internal Server Error";
  }

  res.status(status).json(new AppResponse(false, status, message, null));
};
