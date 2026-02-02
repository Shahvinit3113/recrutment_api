import { EMAIL_ERROR_CODES } from "../constants/error-messages";

/**
 * Error thrown when email sending operation fails
 * @remarks
 * This error wraps underlying provider errors and provides additional context
 * @example
 * ```typescript
 * throw new EmailSendError("Failed to send email", originalError);
 * ```
 */
export class EmailSendError extends Error {
  /**
   * HTTP status code for send errors
   */
  readonly StatusCode = EMAIL_ERROR_CODES.SEND_ERROR;

  /**
   * The original error that caused the send failure, if available
   */
  readonly OriginalError?: Error;

  /**
   * Creates a new EmailSendError instance
   * @param message - Detailed error message describing the send failure
   * @param originalError - Optional original error that caused the failure
   */
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = "EmailSendError";
    this.OriginalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
