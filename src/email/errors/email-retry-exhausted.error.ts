import { EMAIL_ERROR_CODES } from "../constants/error-messages";

/**
 * Error thrown when maximum retry attempts are exhausted
 * @remarks
 * This error is thrown after all retry attempts have failed
 * @example
 * ```typescript
 * throw new EmailRetryExhaustedError(3, lastError);
 * ```
 */
export class EmailRetryExhaustedError extends Error {
  /**
   * HTTP status code for retry exhausted errors
   */
  readonly StatusCode = EMAIL_ERROR_CODES.RETRY_EXHAUSTED;

  /**
   * Number of retry attempts that were made
   */
  readonly Attempts: number;

  /**
   * The last error encountered before exhausting retries
   */
  readonly LastError?: Error;

  /**
   * Creates a new EmailRetryExhaustedError instance
   * @param attempts - Number of retry attempts that were made
   * @param lastError - Optional last error encountered
   */
  constructor(attempts: number, lastError?: Error) {
    super(`Maximum retry attempts (${attempts}) exhausted`);
    this.name = "EmailRetryExhaustedError";
    this.Attempts = attempts;
    this.LastError = lastError;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
