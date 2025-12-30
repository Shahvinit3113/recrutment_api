/**
 * Represents a validation error with HTTP status code 400 (Bad Request)
 * Used when input data fails validation rules
 */
export class ValidationError extends Error {
  readonly StatusCode: number = 400; // Fixed: was 404, should be 400 for validation errors

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
