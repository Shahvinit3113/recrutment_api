import { TYPES } from "@/core/container/types";
import { JWT } from "@/core/utils/jwt.utils";
import { Security } from "@/core/utils/security.utils";
import { AuthResult } from "@/data/models/authResult";
import { LoginRequest } from "@/data/models/loginRequest";
import { NotFoundError } from "@/middleware/errors/notFound.error";
import { UnAuthorizedError } from "@/middleware/errors/unauthorized.error";
import { ValidationError } from "@/middleware/errors/validation.error";
import { Repository } from "@/repository/base/repository";
import { inject } from "inversify";
import { Service } from "@/core/container/auto-register";

@Service({ scope: 'request' })
export class AuthService {
  private readonly _repository: Repository;

  constructor(@inject(TYPES.Repository) _repository: Repository) {
    this._repository = _repository;
  }

  //#region Login
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

    const [user, userInfo] = await Promise.all([
      this._repository.User.getByEmail(loginCredentials.Email),
      this._repository.UserInfo.getByEmail(loginCredentials.Email),
    ]);

    if (!user || !userInfo) {
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
      InfoId: userInfo?.Uid,
    });

    return new AuthResult({
      AccessToken: response.AccessToken,
      RefreshToken: response.RefreshToken,
    });
  }
  //#endregion

  //#region Refresh Token
  /**
   *
   * @param refreahToken
   * @returns
   */
  async refreshToken(refreahToken: string) {
    if (!refreahToken || !refreahToken?.length) {
      throw new ValidationError("RefreshToken is required");
    }

    const decodedData = JWT.decode(refreahToken);

    if (!decodedData?.Payload) {
      throw new ValidationError("Invalid RefreshToken");
    }

    const [user, userInfo] = await Promise.all([
      this._repository.User.getById(decodedData.Payload.UserId, [
        decodedData.Payload.TenantId,
      ]),
      this._repository.UserInfo.getById(decodedData.Payload.InfoId, [
        decodedData.Payload.TenantId,
      ]),
    ]);

    if (!user || !userInfo) {
      throw new ValidationError("User not found");
    }

    const accessToken = JWT.encode({
      UserId: user.Uid,
      Email: user.Email,
      Role: user.Role,
      TenantId: user.OrgId,
      InfoId: userInfo?.Uid,
    });

    return new AuthResult({
      AccessToken: accessToken,
      RefreshToken: refreahToken,
    });
  }
  //#endregion

  //#region Private Functions
  /**
   * Validates the presence of required login credentials
   * @param loginCredentials Object containing email and password
   * @throws ValidationError if email or password is missing
   */
  private validateCredentials(loginCredentials: {
    Email: string;
    Password: string;
  }) {
    if (!loginCredentials?.Email && !loginCredentials?.Email?.length) {
      throw new ValidationError("Email is required");
    }

    if (!loginCredentials?.Password && !loginCredentials?.Password?.length) {
      throw new ValidationError("Password is required");
    }
  }
  //#endregion
}
