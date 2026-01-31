/**
 * Centralized error message constants for email operations
 * Provides consistent error messaging across the email service
 */
export const EMAIL_ERROR_MESSAGES = {
  //#region Configuration Errors
  INVALID_PROVIDER_TYPE: "Invalid email provider type. Supported providers: 'nodemailer', 'resend'",
  MISSING_SMTP_HOST: "SMTP host is required for Nodemailer configuration",
  MISSING_SMTP_PORT: "SMTP port is required for Nodemailer configuration",
  INVALID_SMTP_PORT: "SMTP port must be a valid number between 1 and 65535",
  MISSING_SMTP_USER: "SMTP user is required for Nodemailer configuration",
  MISSING_SMTP_PASSWORD: "SMTP password is required for Nodemailer configuration",
  MISSING_SMTP_FROM: "From address is required for Nodemailer configuration",
  MISSING_RESEND_API_KEY: "Resend API key is required for Resend configuration",
  INVALID_FROM_EMAIL: "From email address is not valid",
  //#endregion

  //#region Email Options Errors
  MISSING_RECIPIENT: "At least one recipient (To, Cc, or Bcc) is required",
  INVALID_EMAIL_ADDRESS: "Invalid email address format",
  MISSING_SUBJECT: "Email subject is required",
  MISSING_BODY: "Email body (Html or Text) is required",
  INVALID_ATTACHMENT: "Attachment must have valid Filename and Content",
  INVALID_ATTACHMENT_ENCODING: "Invalid attachment encoding. Supported: 'base64', 'binary', 'hex'",
  //#endregion

  //#region Send Errors
  SEND_FAILED: "Failed to send email",
  PROVIDER_ERROR: "Email provider encountered an error",
  RETRY_EXHAUSTED: "Maximum retry attempts exhausted",
  BULK_SEND_PARTIAL_FAILURE: "Bulk email send completed with some failures",
  //#endregion

  //#region Retry Errors
  INVALID_RETRY_ATTEMPTS: "Retry attempts must be a positive number",
  INVALID_RETRY_DELAY: "Retry delay must be a positive number",
  //#endregion
} as const;

/**
 * HTTP status codes for email errors
 */
export const EMAIL_ERROR_CODES = {
  CONFIGURATION_ERROR: 400,
  VALIDATION_ERROR: 400,
  SEND_ERROR: 500,
  PROVIDER_ERROR: 502,
  RETRY_EXHAUSTED: 503,
} as const;

/**
 * Default configuration values for email service
 */
export const EMAIL_DEFAULTS = {
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  MAX_RETRY_ATTEMPTS: 3,
  INITIAL_RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  CONNECTION_TIMEOUT_MS: 30000,
  SOCKET_TIMEOUT_MS: 30000,
} as const;
