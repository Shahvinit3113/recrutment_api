import { Request, Response, NextFunction } from "express";
import { TYPES } from "@/core/container/types";
import { JWT } from "@/core/helper/JWT";
import { UnAuthorizedError } from "./errors/unauthorized.error.";
import { container } from "@/core/container/container";
import { CallerService } from "@/service/caller/caller.service";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnAuthorizedError("Token is required");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // decode token
    const decodeResult = JWT.decode(token);

    if (!decodeResult.Valid) {
      throw new UnAuthorizedError("Invalid Access token");
    }

    if (decodeResult.Expired) {
      throw new UnAuthorizedError("Token Expired");
    }

    const user = decodeResult.Payload;

    const _callerService = container.get<CallerService>(TYPES.Caller);

    _callerService.setCaller({
      Role: user?.Role!,
      Email: user?.Email!,
      UserId: user?.UserId!,
    });

    next();
  } catch (error) {
    next(error);
  }
};
