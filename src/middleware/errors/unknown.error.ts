export class UnknownError extends Error {
  StatusCode = 500;

  constructor(message?: string, status?: number) {
    super(message || "Unknwon error occured");
    if (status) {
      this.StatusCode = status;
    }
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
