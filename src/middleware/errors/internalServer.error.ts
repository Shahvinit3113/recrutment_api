export class InternalServerError extends Error {
  readonly StatusCode = 500;

  constructor(message?: string) {
    super(message || "Internal Server error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
