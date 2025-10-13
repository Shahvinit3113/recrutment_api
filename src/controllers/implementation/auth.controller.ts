import { controller } from "@/core/decorators/controller.decorator";
import { Post } from "@/core/decorators/route.decorator";
import { inject, injectable } from "inversify";
import { Response as ApiResponse } from "@/data/response/response";
import { Request, Response } from "express";
import { TYPES } from "@/core/container/types";
import { IAuthService } from "@/service/implementation/auth.service";

@injectable()
@controller("/auth")
export class AuthController {
  private readonly _authService: IAuthService;

  constructor(@inject(TYPES.AuthService) authService: IAuthService) {
    this._authService = authService;
  }

  @Post("/login")
  async login(
    req: Request<any, any, { Email: string; Password: string }, any>,
    res: Response<ApiResponse<{ AccessToken: string; RefreshToken: string }>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._authService.loginUser(req.body)
      )
    );
  }
}
