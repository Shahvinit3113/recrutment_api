/**
 * Represents a validation error with HTTP status code 404
 * Used when input data fails validation rules
 */
export class ValidationError extends Error {
  readonly StatusCode: number = 404;

  /**
   * Creates a new validation error
   * @param message Optional custom validation error message
   */
  constructor(message?: string) {
    super(message || "Validation error occurred");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
