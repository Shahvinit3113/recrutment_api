export class ValidationError extends Error {
  readonly StatusCode: number = 404;
  constructor(message?: string) {
    super(message || "Validation error occurred");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
