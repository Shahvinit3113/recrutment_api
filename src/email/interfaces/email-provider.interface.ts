import { EmailOptions } from "../types/email-options.types";
import { EmailResult } from "../types/email-result.types";

/**
 * Interface for email provider implementations
 * @remarks
 * Defines the contract that all email providers must implement
 * Following the Strategy Pattern for interchangeable email providers
 */
export interface IEmailProvider {
  /**
   * Sends a single email using the provider's implementation
   * @param options - Email options containing recipients, subject, body, etc.
   * @returns Promise resolving to EmailResult with send details
   * @throws {EmailProviderError} When the provider encounters an error
   * @throws {EmailSendError} When sending fails
   * @example
   * ```typescript
   * const result = await provider.sendEmail({
   *   To: ["user@example.com"],
   *   Subject: "Test",
   *   Html: "<p>Hello</p>"
   * });
   * ```
   */
  sendEmail(options: EmailOptions): Promise<EmailResult>;
  
  /**
   * Gets the provider name
   * @returns Provider name string
   */
  getProviderName(): string;
}
