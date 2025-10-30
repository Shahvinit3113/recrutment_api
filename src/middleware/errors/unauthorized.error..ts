/**
 * Represents an unauthorized error with HTTP status code 401
 * Used when authentication fails or is missing
 */
export class UnAuthorizedError extends Error {
  readonly StatusCode = 401;

  /**
   * Creates a new unauthorized error
   * @param message Optional custom error message
   */
  constructor(message?: string) {
    super(message || "Unauthorized error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
