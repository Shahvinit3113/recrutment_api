export class NotFoundError extends Error {
  readonly StatusCode = 404;

  constructor(message?: string) {
    super(message || "Not found error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
