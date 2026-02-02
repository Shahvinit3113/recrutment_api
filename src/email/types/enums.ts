/**
 * Supported email provider types
 * @remarks
 * Currently supports Nodemailer (SMTP) and Resend (API-based)
 */
export enum ProviderType {
  /**
   * Nodemailer SMTP provider
   */
  Nodemailer = "nodemailer",
  
  /**
   * Resend API provider
   */
  Resend = "resend",
}

/**
 * Email attachment encoding types
 */
export enum AttachmentEncoding {
  /**
   * Base64 encoding
   */
  Base64 = "base64",
  
  /**
   * Binary encoding
   */
  Binary = "binary",
  
  /**
   * Hexadecimal encoding
   */
  Hex = "hex",
}

/**
 * Email priority levels
 */
export enum EmailPriority {
  /**
   * High priority email
   */
  High = "high",
  
  /**
   * Normal priority email (default)
   */
  Normal = "normal",
  
  /**
   * Low priority email
   */
  Low = "low",
}
