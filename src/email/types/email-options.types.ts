import { EmailPriority } from "./enums";
import { EmailAddress, EmailAttachment } from "./email-address.types";

/**
 * Options for sending an email
 * @remarks
 * Contains all necessary information to send an email including recipients, content, and metadata
 */
export interface EmailOptions {
  /**
   * Primary recipients (To)
   * @remarks
   * At least one recipient (To, Cc, or Bcc) is required
   */
  To?: EmailAddress[];
  
  /**
   * Carbon copy recipients (Cc)
   */
  Cc?: EmailAddress[];
  
  /**
   * Blind carbon copy recipients (Bcc)
   */
  Bcc?: EmailAddress[];
  
  /**
   * Email subject line
   */
  Subject: string;
  
  /**
   * Plain text email body
   * @remarks
   * Either Text or Html is required
   */
  Text?: string;
  
  /**
   * HTML email body
   * @remarks
   * Either Text or Html is required
   */
  Html?: string;
  
  /**
   * Reply-To email address
   */
  ReplyTo?: EmailAddress;
  
  /**
   * Email attachments
   */
  Attachments?: EmailAttachment[];
  
  /**
   * Custom email headers
   * @example
   * ```typescript
   * Headers: {
   *   "X-Custom-Header": "value",
   *   "X-Priority": "1"
   * }
   * ```
   */
  Headers?: Record<string, string>;
  
  /**
   * Email priority
   * @default EmailPriority.Normal
   */
  Priority?: EmailPriority;
  
  /**
   * Message ID for tracking
   * @remarks
   * If not provided, provider will generate one
   */
  MessageId?: string;
  
  /**
   * Tags for email categorization
   * @remarks
   * Provider-specific feature, may not be supported by all providers
   */
  Tags?: Record<string, string>;
}
