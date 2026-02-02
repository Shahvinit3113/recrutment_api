import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { IEmailProvider } from "../../interfaces/email-provider.interface";
import { NodemailerConfig } from "../../config/email-config";
import { EmailOptions } from "../../types/email-options.types";
import { EmailResult } from "../../types/email-result.types";
import {
  EmailAddress,
  hasValidRecipients,
  validateEmailAddresses,
} from "../../types/email-address.types";
import { EmailProviderError, EmailSendError } from "../../errors";
import { EMAIL_ERROR_MESSAGES } from "../../constants/error-messages";

/**
 * Nodemailer SMTP email provider implementation
 * @remarks
 * Implements IEmailProvider using Nodemailer for SMTP-based email sending
 * Creates a new transporter for each send operation for fresh configuration
 */
export class NodemailerProvider implements IEmailProvider {
  private readonly _config: NodemailerConfig;

  /**
   * Creates a new NodemailerProvider instance
   * @param config - Validated Nodemailer configuration
   */
  constructor(config: NodemailerConfig) {
    this._config = config;
  }

  //#region IEmailProvider Implementation

  /**
   * Sends an email using Nodemailer SMTP
   * @param options - Email options
   * @returns EmailResult with send details
   * @throws {EmailProviderError} When Nodemailer encounters an error
   * @throws {EmailSendError} When email validation or sending fails
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const startTime = Date.now();

    try {
      // Validate email options
      this.validateEmailOptions(options);

      // Create transporter for this send operation
      const transporter = this.createTransporter();

      // Build mail options
      const mailOptions = this.buildMailOptions(options);

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Return success result
      return {
        Success: true,
        MessageId: info.messageId,
        SentAt: new Date(),
        Provider: this.getProviderName(),
        RetryAttempts: 0,
        Metadata: {
          Response: info.response,
          Accepted: info.accepted,
          Rejected: info.rejected,
          Pending: info.pending,
          Envelope: info.envelope,
        },
      };
    } catch (error) {
      // Handle and wrap errors
      return this.handleSendError(error, startTime);
    }
  }

  /**
   * Gets the provider name
   * @returns Provider name string
   */
  getProviderName(): string {
    return "Nodemailer";
  }

  //#endregion

  //#region Private Methods

  /**
   * Creates a Nodemailer transporter with current configuration
   * @returns Configured Nodemailer transporter
   * @throws {EmailProviderError} When transporter creation fails
   */
  private createTransporter(): Transporter {
    try {
      return nodemailer.createTransport({
        host: this._config.Host,
        port: this._config.Port,
        secure: this._config.Secure,
        auth: {
          user: this._config.User,
          pass: this._config.Password,
        },
        connectionTimeout: this._config.ConnectionTimeoutMs,
        greetingTimeout: this._config.SocketTimeoutMs,
        socketTimeout: this._config.SocketTimeoutMs,
        tls: {
          rejectUnauthorized: !this._config.IgnoreTLS,
        },
        requireTLS: this._config.RequireTLS,
      });
    } catch (error) {
      throw new EmailProviderError(
        "Failed to create Nodemailer transporter",
        this.getProviderName(),
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Validates email options before sending
   * @param options - Email options to validate
   * @throws {EmailSendError} When validation fails
   */
  private validateEmailOptions(options: EmailOptions): void {
    // Check for at least one recipient
    if (!hasValidRecipients(options.To, options.Cc, options.Bcc)) {
      throw new EmailSendError(EMAIL_ERROR_MESSAGES.MISSING_RECIPIENT);
    }

    // Validate email addresses
    if (options.To && !validateEmailAddresses(options.To)) {
      throw new EmailSendError(
        `${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (To)`,
      );
    }

    if (options.Cc && !validateEmailAddresses(options.Cc)) {
      throw new EmailSendError(
        `${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (Cc)`,
      );
    }

    if (options.Bcc && !validateEmailAddresses(options.Bcc)) {
      throw new EmailSendError(
        `${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (Bcc)`,
      );
    }

    // Validate subject
    if (!options.Subject || options.Subject.trim().length === 0) {
      throw new EmailSendError(EMAIL_ERROR_MESSAGES.MISSING_SUBJECT);
    }

    // Validate body
    if (
      (!options.Text || options.Text.trim().length === 0) &&
      (!options.Html || options.Html.trim().length === 0)
    ) {
      throw new EmailSendError(EMAIL_ERROR_MESSAGES.MISSING_BODY);
    }

    // Validate attachments if present
    if (options.Attachments && options.Attachments.length > 0) {
      for (const attachment of options.Attachments) {
        if (!attachment.Filename) {
          throw new EmailSendError(EMAIL_ERROR_MESSAGES.INVALID_ATTACHMENT);
        }
        if (!attachment.Content && !attachment.Path) {
          throw new EmailSendError(
            `${EMAIL_ERROR_MESSAGES.INVALID_ATTACHMENT} - Content or Path required`,
          );
        }
      }
    }
  }

  /**
   * Builds Nodemailer mail options from EmailOptions
   * @param options - Email options
   * @returns Nodemailer SendMailOptions
   */
  private buildMailOptions(options: EmailOptions): SendMailOptions {
    const mailOptions: SendMailOptions = {
      from: this._config.FromName
        ? `"${this._config.FromName}" <${this._config.From}>`
        : this._config.From,
      subject: options.Subject,
      text: options.Text,
      html: options.Html,
    };

    // Add recipients
    if (options.To && options.To.length > 0) {
      mailOptions.to = this.formatAddresses(options.To);
    }

    if (options.Cc && options.Cc.length > 0) {
      mailOptions.cc = this.formatAddresses(options.Cc);
    }

    if (options.Bcc && options.Bcc.length > 0) {
      mailOptions.bcc = this.formatAddresses(options.Bcc);
    }

    // Add reply-to
    if (options.ReplyTo) {
      mailOptions.replyTo = this.formatAddress(options.ReplyTo);
    }

    // Add attachments
    if (options.Attachments && options.Attachments.length > 0) {
      mailOptions.attachments = options.Attachments.map((attachment) => ({
        filename: attachment.Filename,
        content: attachment.Content,
        path: attachment.Path,
        contentType: attachment.ContentType,
        encoding: attachment.Encoding,
        cid: attachment.Cid,
      }));
    }

    // Add custom headers
    if (options.Headers) {
      mailOptions.headers = options.Headers;
    }

    // Add priority
    if (options.Priority) {
      mailOptions.priority = options.Priority;
    }

    // Add message ID if provided
    if (options.MessageId) {
      mailOptions.messageId = options.MessageId;
    }

    return mailOptions;
  }

  /**
   * Formats a single email address for Nodemailer
   * @param address - Email address to format
   * @returns Formatted email string
   */
  private formatAddress(address: EmailAddress): string {
    if (typeof address === "string") {
      return address;
    }

    if (address.Name) {
      return `"${address.Name}" <${address.Email}>`;
    }

    return address.Email;
  }

  /**
   * Formats an array of email addresses for Nodemailer
   * @param addresses - Email addresses to format
   * @returns Array of formatted email strings
   */
  private formatAddresses(addresses: EmailAddress[]): string[] {
    return addresses.map((addr) => this.formatAddress(addr));
  }

  /**
   * Handles send errors and creates EmailResult
   * @param error - Error that occurred during send
   * @param startTime - Start time of send operation
   * @returns EmailResult with error details
   */
  private handleSendError(error: unknown, startTime: number): EmailResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Determine if it's a provider error or send error
    let finalError: Error;
    if (
      error instanceof EmailProviderError ||
      error instanceof EmailSendError
    ) {
      finalError = error;
    } else if (error instanceof Error) {
      finalError = new EmailProviderError(
        `${EMAIL_ERROR_MESSAGES.PROVIDER_ERROR}: ${errorMessage}`,
        this.getProviderName(),
        error,
      );
    } else {
      finalError = new EmailSendError(EMAIL_ERROR_MESSAGES.SEND_FAILED);
    }

    return {
      Success: false,
      SentAt: new Date(),
      Provider: this.getProviderName(),
      RetryAttempts: 0,
      Error: finalError.message,
      ErrorDetails: {
        Code: "NODEMAILER_ERROR",
        Message: errorMessage,
        StackTrace: errorStack,
      },
    };
  }

  //#endregion
}
