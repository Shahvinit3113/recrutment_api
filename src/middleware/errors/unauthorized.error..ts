export class UnAuthorizedError extends Error {
  readonly StatusCode = 401;

  constructor(message?: string) {
    super(message || "Unauthorized error");
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
