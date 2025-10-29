import { TYPES } from "@/core/container/types";
import { JWT } from "@/core/utils/jwt.utils";
import { Security } from "@/core/utils/security.utils";
import { AuthResult } from "@/data/models/authResult";
import { LoginRequest } from "@/data/models/loginRequest";
import { NotFoundError } from "@/middleware/errors/notFound.error";
import { UnAuthorizedError } from "@/middleware/errors/unauthorized.error.";
import { ValidationError } from "@/middleware/errors/validation.error";
import { Repository } from "@/repository/base/repository";
import { inject } from "inversify";

export class AuthService {
  private readonly _repository: Repository;

  constructor(@inject(TYPES.Repository) _repository: Repository) {
    this._repository = _repository;
  }

  async loginUser(loginCredentials: LoginRequest) {
    this.validateCredentials(loginCredentials);

    const user = await this._repository.User.getByEmail(loginCredentials.Email);

    if (!user || typeof user == "undefined") {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await Security.comparePassword(
      loginCredentials.Password,
      user.Password
    );

    if (!isPasswordValid) {
      throw new UnAuthorizedError("Invalid email or password.");
    }

    const response = JWT.generateTokenPair({
      UserId: user.Uid,
      Email: user.Email,
      Role: user.Role,
      TenantId: user.OrgId,
    });

    return new AuthResult({
      AccessToken: response.AccessToken,
      RefreshToken: response.RefreshToken,
    });
  }

  validateCredentials(loginCredentials: { Email: string; Password: string }) {
    if (!loginCredentials?.Email && !loginCredentials?.Email?.length) {
      throw new ValidationError("Email is required");
    }

    if (!loginCredentials?.Password && !loginCredentials?.Password?.length) {
      throw new ValidationError("Password is required");
    }
  }
}
