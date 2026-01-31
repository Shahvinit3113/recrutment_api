import { EMAIL_ERROR_CODES } from "../constants/error-messages";

/**
 * Error thrown when email configuration is invalid or incomplete
 * @remarks
 * This error is thrown during configuration validation before provider initialization
 * @example
 * ```typescript
 * throw new EmailConfigurationError("SMTP host is required");
 * ```
 */
export class EmailConfigurationError extends Error {
  /**
   * HTTP status code for configuration errors
   */
  readonly StatusCode = EMAIL_ERROR_CODES.CONFIGURATION_ERROR;

  /**
   * Creates a new EmailConfigurationError instance
   * @param message - Detailed error message describing the configuration issue
   */
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
