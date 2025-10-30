/**
 * Represents an unknown error with configurable HTTP status code
 * Used as a fallback for unhandled or unexpected errors
 */
export class UnknownError extends Error {
  StatusCode = 500;

  /**
   * Creates a new unknown error
   * @param message Optional custom error message
   * @param status Optional HTTP status code (defaults to 500)
   */
  constructor(message?: string, status?: number) {
    super(message || "Unknwon error occured");
    if (status) {
      this.StatusCode = status;
    }
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
