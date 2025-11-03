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

  /**
   * Authenticates a user and generates access tokens
   * @param loginCredentials User's login credentials containing email and password
   * @returns AuthResult containing access and refresh tokens
   * @throws ValidationError if credentials are missing
   * @throws NotFoundError if user doesn't exist
   * @throws UnAuthorizedError if password is invalid
   */
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

  /**
   * Validates the presence of required login credentials
   * @param loginCredentials Object containing email and password
   * @throws ValidationError if email or password is missing
   */
  validateCredentials(loginCredentials: { Email: string; Password: string }) {
    if (!loginCredentials?.Email && !loginCredentials?.Email?.length) {
      throw new ValidationError("Email is required");
    }

    if (!loginCredentials?.Password && !loginCredentials?.Password?.length) {
      throw new ValidationError("Password is required");
    }
  }
}
