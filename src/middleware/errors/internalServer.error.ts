/**
 * Represents an internal server error with HTTP status code 500
 * Used for unexpected errors or system failures
 */
export class InternalServerError extends Error {
  readonly StatusCode = 500;

  /**
   * Creates a new internal server error
   * @param message Optional custom error message
   */
  constructor(message?: string) {
    super(message || "Internal Server error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
