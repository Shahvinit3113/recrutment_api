/**
 * Email module main export
 * @remarks
 * Provides a complete email service implementation with:
 * - Strategy Pattern for swappable email providers (Nodemailer, Resend)
 * - Configuration-driven provider selection
 * - Single and bulk email sending
 * - Configurable retry logic with exponential backoff
 * - Comprehensive error handling
 * - Type-safe interfaces and configurations
 * 
 * @example
 * ```typescript
 * import { EmailService, NodemailerConfig, EmailOptions } from '@/email';
 * 
 * // Configure provider
 * const config = new NodemailerConfig({
 *   Host: "smtp.gmail.com",
 *   Port: 587,
 *   User: "user@gmail.com",
 *   Password: "password",
 *   From: "noreply@example.com"
 * });
 * 
 * // Send email
 * const result = await EmailService.sendSingleEmail(
 *   config,
 *   {
 *     To: ["recipient@example.com"],
 *     Subject: "Test Email",
 *     Html: "<p>Hello World</p>"
 *   }
 * );
 * ```
 */

//#region Main Service
export { EmailService } from "./services/email.service";
//#endregion

//#region Configuration Classes
export { 
  EmailConfig, 
  NodemailerConfig, 
  ResendConfig 
} from "./config";
//#endregion

//#region Types
export {
  // Enums
  ProviderType,
  AttachmentEncoding,
  EmailPriority,
  
  // Address Types
  EmailAddress,
  EmailAttachment,
  
  // Options
  EmailOptions,
  
  // Results
  EmailResult,
  BulkEmailResult,
  BulkEmailItemResult,
  
  // Retry
  RetryOptions,
  
  // Utility Functions
  isValidEmail,
  extractEmailAddress,
  validateEmailAddresses,
  hasValidRecipients,
  createDefaultRetryOptions,
  mergeRetryOptions,
  calculateRetryDelay,
  validateRetryOptions,
} from "./types";
//#endregion

//#region Interfaces
export { IEmailProvider } from "./interfaces";
//#endregion

//#region Errors
export {
  EmailConfigurationError,
  EmailSendError,
  EmailProviderError,
  EmailRetryExhaustedError,
} from "./errors";
//#endregion

//#region Constants
export { 
  EMAIL_ERROR_MESSAGES, 
  EMAIL_ERROR_CODES, 
  EMAIL_DEFAULTS 
} from "./constants/error-messages";
//#endregion

//#region Advanced Exports (Optional - for direct provider access)
export { 
  EmailProviderFactory,
  RetryHandler,
  NodemailerProvider,
  ResendProvider,
} from "./services";
//#endregion
