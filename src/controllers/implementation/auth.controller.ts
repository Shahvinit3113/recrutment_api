import { controller } from "@/core/decorators/controller.decorator";
import { Post } from "@/core/decorators/route.decorator";
import { inject, injectable } from "inversify";
import { Response as ApiResponse } from "@/data/response/response";
import { Request, Response } from "express";
import { TYPES } from "@/core/container/types";
import { Public } from "@/core/decorators/public.decorator";
import { LoginRequest } from "@/data/models/loginRequest";
import { AuthResult } from "@/data/models/authResult";
import { AuthService } from "@/service/implementation/auth.service";

@injectable()
@controller("/auth")
export class AuthController {
  private readonly _authService: AuthService;

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
    this._authService = authService;
  }

  @Public()
  @Post("/login")
  async login(
    req: Request<any, any, LoginRequest, any>,
    res: Response<ApiResponse<AuthResult>>
  ) {
    return res.send(
      new ApiResponse<AuthResult>(
        true,
        200,
        "Success",
        await this._authService.loginUser(req.body)
      )
    );
  }
}
