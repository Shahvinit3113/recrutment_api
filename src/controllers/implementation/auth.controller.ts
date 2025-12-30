import { Post } from "@/core/decorators/route.decorator";
import { inject } from "inversify";
import { Response as ApiResponse } from "@/data/response/response";
import { Response } from "express";
import { TYPES } from "@/core/container/types";
import { Public } from "@/core/decorators/public.decorator";
import { LoginRequest } from "@/data/models/loginRequest";
import { AuthResult } from "@/data/models/authResult";
import { AuthService } from "@/service/implementation/auth.service";
import { AutoController } from "@/core/container/auto-register";
import { BodyRequest } from "@/core/types/express";
import { ValidateBodySchema } from "@/core/decorators/validation.decorator";
import { LoginSchema, RefreshTokenSchema } from "@/db/schemas/auth.schema";

@AutoController("/auth")
export class AuthController {
  private readonly _authService: AuthService;

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
    this._authService = authService;
  }

  @Public()
  @Post("/login")
  @ValidateBodySchema(LoginSchema)
  async login(
    req: BodyRequest<LoginRequest>,
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

  @Public()
  @Post("/refresh")
  @ValidateBodySchema(RefreshTokenSchema)
  async refreshToken(
    req: BodyRequest<{ RefreshToken: string }>,
    res: Response<ApiResponse<AuthResult>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._authService.refreshToken(req.body?.RefreshToken)
      )
    );
  }
}
