import { AttachmentEncoding } from "./enums";

/**
 * Email address with optional display name
 * @remarks
 * Can be a simple string email or an object with name and email
 * @example
 * ```typescript
 * // Simple format
 * const recipient: EmailAddress = "user@example.com";
 * 
 * // Named format
 * const recipient: EmailAddress = {
 *   Email: "user@example.com",
 *   Name: "John Doe"
 * };
 * ```
 */
export type EmailAddress = string | {
  /**
   * Email address
   */
  Email: string;
  
  /**
   * Display name for the email address
   */
  Name?: string;
};

/**
 * Email attachment data
 * @remarks
 * Supports both file path and raw content attachments
 */
export interface EmailAttachment {
  /**
   * Filename for the attachment
   */
  Filename: string;
  
  /**
   * Content of the attachment (Buffer or base64 string)
   */
  Content?: Buffer | string;
  
  /**
   * Path to the file to attach (alternative to Content)
   */
  Path?: string;
  
  /**
   * Content type (MIME type)
   * @default Automatically detected from filename
   */
  ContentType?: string;
  
  /**
   * Encoding for the attachment content
   * @default "base64"
   */
  Encoding?: AttachmentEncoding;
  
  /**
   * Content-ID for inline images
   * @remarks
   * Used for embedding images in HTML emails
   * @example "logo@company.com"
   */
  Cid?: string;
}

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Extracts email address from EmailAddress type
 * @param address - Email address (string or object)
 * @returns Email address string or null if invalid
 */
export function extractEmailAddress(address: EmailAddress): string | null {
  if (typeof address === "string") {
    return address.trim();
  }
  
  if (address && typeof address === "object" && address.Email) {
    return address.Email.trim();
  }
  
  return null;
}

/**
 * Validates an array of email addresses
 * @param addresses - Array of email addresses to validate
 * @returns True if all addresses are valid
 */
export function validateEmailAddresses(addresses?: EmailAddress[]): boolean {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return false;
  }
  
  return addresses.every((address) => {
    const email = extractEmailAddress(address);
    return email !== null && isValidEmail(email);
  });
}

/**
 * Validates at least one recipient exists
 * @param to - To recipients
 * @param cc - Cc recipients
 * @param bcc - Bcc recipients
 * @returns True if at least one valid recipient exists
 */
export function hasValidRecipients(
  to?: EmailAddress[],
  cc?: EmailAddress[],
  bcc?: EmailAddress[]
): boolean {
  const hasTo = !!(to && Array.isArray(to) && to.length > 0);
  const hasCc = !!(cc && Array.isArray(cc) && cc.length > 0);
  const hasBcc = !!(bcc && Array.isArray(bcc) && bcc.length > 0);
  
  return hasTo || hasCc || hasBcc;
}
