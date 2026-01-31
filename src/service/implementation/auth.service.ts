import { TYPES } from "@/core/container/types";
import { JWT } from "@/core/utils/jwt.utils";
import { Security } from "@/core/utils/security.utils";
import { TemplateHelper } from "@/core/helper/template.helper";
import { AuthResult } from "@/data/models/authResult";
import { LoginRequest } from "@/data/models/loginRequest";
import { EmailService, NodemailerConfig } from "@/email";
import { NotFoundError } from "@/middleware/errors/notFound.error";
import { UnAuthorizedError } from "@/middleware/errors/unauthorized.error.";
import { ValidationError } from "@/middleware/errors/validation.error";
import { Repository } from "@/repository/base/repository";
import { inject, injectable } from "inversify";

@injectable()
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
      user.Password,
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

    // Send login notification email (non-blocking)
    this.sendLoginNotificationEmail(
      user.Email,
      userInfo?.FirstName || "User",
    ).catch((error) => {
      console.error("Failed to send login notification email:", error);
      // Don't throw - email failure shouldn't block login
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

  /**
   * Sends a login notification email to the user
   * @param userEmail User's email address
   * @param userName User's first name
   * @returns Promise that resolves when email is sent
   */
  private async sendLoginNotificationEmail(
    userEmail: string,
    userName: string,
  ): Promise<void> {
    try {
      // Create email configuration
      const emailConfig = new NodemailerConfig({
        Host: "smtp.gmail.com",
        Port: 587,
        Secure: false,
        User: "yashsuthar352@gmail.com",
        Password: "ddns dnwa rcry rkxp",
        From: "yashsuthar352@gmail.com",
        FromName: "Recruitment System",
      });

      // Get current date and time
      const loginTime = new Date();
      const formattedDate = loginTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = loginTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Get HTML template with replaced variables
      const htmlContent = TemplateHelper.getLoginNotificationTemplate({
        userName,
        userEmail,
        loginDate: formattedDate,
        loginTime: formattedTime,
      });

      // Generate plain text version
      const textContent = `
      Login Notification - Recruitment System

      Hello ${userName},

      Your account was successfully accessed.

      Details:
      - Email: ${userEmail}
      - Date: ${formattedDate}
      - Time: ${formattedTime}

      Security Notice: If you did not perform this login, please secure your account immediately.

      Thank you for using our Recruitment System!

      © ${new Date().getFullYear()} Recruitment System. All rights reserved.
      This is an automated message, please do not reply.
      `;

      // Send login notification
      const result = await EmailService.sendSingleEmail(
        emailConfig,
        {
          To: [{ Email: userEmail, Name: userName }],
          Subject: "Login Notification - Recruitment System",
          Html: htmlContent,
          Text: textContent,
        },
        {
          MaxAttempts: 2,
          InitialDelayMs: 1000,
        },
      );

      if (result.Success) {
        console.log(
          `Login notification email sent to ${userEmail} - Message ID: ${result.MessageId}`,
        );
      } else {
        console.error(
          `Failed to send login notification to ${userEmail}:`,
          result.Error,
        );
      }
    } catch (error) {
      console.error("Error in sendLoginNotificationEmail:", error);
      throw error;
    }
  }
  //#endregion
}
