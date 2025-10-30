/**
 * Represents a not found error with HTTP status code 404
 * Used when requested resources cannot be found
 */
export class NotFoundError extends Error {
  readonly StatusCode = 404;

  /**
   * Creates a new not found error
   * @param message Optional custom error message
   */
  constructor(message?: string) {
    super(message || "Not found error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
