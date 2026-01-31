import { EMAIL_ERROR_CODES } from "../constants/error-messages";

/**
 * Error thrown when the email provider encounters an error
 * @remarks
 * This error indicates issues with the external email service provider
 * @example
 * ```typescript
 * throw new EmailProviderError("Resend API returned error", apiError);
 * ```
 */
export class EmailProviderError extends Error {
  /**
   * HTTP status code for provider errors
   */
  readonly StatusCode = EMAIL_ERROR_CODES.PROVIDER_ERROR;

  /**
   * The provider name that encountered the error
   */
  readonly Provider: string;

  /**
   * The original error from the provider, if available
   */
  readonly OriginalError?: Error;

  /**
   * Creates a new EmailProviderError instance
   * @param message - Detailed error message describing the provider issue
   * @param provider - Name of the email provider that encountered the error
   * @param originalError - Optional original error from the provider
   */
  constructor(message: string, provider: string, originalError?: Error) {
    super(message);
    this.name = "EmailProviderError";
    this.Provider = provider;
    this.OriginalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
