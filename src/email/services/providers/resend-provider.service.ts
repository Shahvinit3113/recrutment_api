import { Resend } from "resend";
import { IEmailProvider } from "../../interfaces/email-provider.interface";
import { ResendConfig } from "../../config/email-config";
import { EmailOptions } from "../../types/email-options.types";
import { EmailResult } from "../../types/email-result.types";
import { 
  EmailAddress, 
  extractEmailAddress,
  hasValidRecipients,
  validateEmailAddresses 
} from "../../types/email-address.types";
import { EmailProviderError, EmailSendError } from "../../errors";
import { EMAIL_ERROR_MESSAGES } from "../../constants/error-messages";

/**
 * Resend API email provider implementation
 * @remarks
 * Implements IEmailProvider using Resend API for modern email sending
 * Creates a new Resend client for each send operation for fresh configuration
 */
export class ResendProvider implements IEmailProvider {
  private readonly _config: ResendConfig;
  
  /**
   * Creates a new ResendProvider instance
   * @param config - Validated Resend configuration
   */
  constructor(config: ResendConfig) {
    this._config = config;
  }
  
  //#region IEmailProvider Implementation
  
  /**
   * Sends an email using Resend API
   * @param options - Email options
   * @returns EmailResult with send details
   * @throws {EmailProviderError} When Resend API encounters an error
   * @throws {EmailSendError} When email validation or sending fails
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const startTime = Date.now();
    
    try {
      // Validate email options
      this.validateEmailOptions(options);
      
      // Create Resend client for this send operation
      const resend = new Resend(this._config.ApiKey);
      
      // Build email data
      const emailData = this.buildEmailData(options);
      
      // Send email
      const response = await resend.emails.send(emailData);
      
      // Check for errors in response
      if (!response || response.error) {
        throw new EmailProviderError(
          response.error?.message || "Unknown Resend API error",
          this.getProviderName()
        );
      }
      
      // Return success result
      return {
        Success: true,
        MessageId: response.data?.id,
        SentAt: new Date(),
        Provider: this.getProviderName(),
        RetryAttempts: 0,
        Metadata: {
          ResendId: response.data?.id,
          ResponseData: response.data,
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
    return "Resend";
  }
  
  //#endregion
  
  //#region Private Methods
  
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
      throw new EmailSendError(`${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (To)`);
    }
    
    if (options.Cc && !validateEmailAddresses(options.Cc)) {
      throw new EmailSendError(`${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (Cc)`);
    }
    
    if (options.Bcc && !validateEmailAddresses(options.Bcc)) {
      throw new EmailSendError(`${EMAIL_ERROR_MESSAGES.INVALID_EMAIL_ADDRESS} (Bcc)`);
    }
    
    // Validate subject
    if (!options.Subject || options.Subject.trim().length === 0) {
      throw new EmailSendError(EMAIL_ERROR_MESSAGES.MISSING_SUBJECT);
    }
    
    // Validate body
    if ((!options.Text || options.Text.trim().length === 0) && 
        (!options.Html || options.Html.trim().length === 0)) {
      throw new EmailSendError(EMAIL_ERROR_MESSAGES.MISSING_BODY);
    }
    
    // Validate attachments if present
    if (options.Attachments && options.Attachments.length > 0) {
      for (const attachment of options.Attachments) {
        if (!attachment.Filename) {
          throw new EmailSendError(EMAIL_ERROR_MESSAGES.INVALID_ATTACHMENT);
        }
        if (!attachment.Content && !attachment.Path) {
          throw new EmailSendError(`${EMAIL_ERROR_MESSAGES.INVALID_ATTACHMENT} - Content or Path required`);
        }
      }
    }
  }
  
  /**
   * Builds Resend email data from EmailOptions
   * @param options - Email options
   * @returns Resend email data object
   */
  private buildEmailData(options: EmailOptions): any {
    const emailData: any = {
      from: this._config.FromName 
        ? `${this._config.FromName} <${this._config.From}>`
        : this._config.From,
      subject: options.Subject,
    };
    
    // Add recipients (Resend requires at least 'to')
    if (options.To && options.To.length > 0) {
      emailData.to = this.formatAddresses(options.To);
    }
    
    if (options.Cc && options.Cc.length > 0) {
      emailData.cc = this.formatAddresses(options.Cc);
    }
    
    if (options.Bcc && options.Bcc.length > 0) {
      emailData.bcc = this.formatAddresses(options.Bcc);
    }
    
    // Add body (prefer HTML over text)
    if (options.Html) {
      emailData.html = options.Html;
    } else if (options.Text) {
      emailData.text = options.Text;
    }
    
    // Add reply-to
    if (options.ReplyTo) {
      emailData.reply_to = this.formatAddress(options.ReplyTo);
    }
    
    // Add attachments
    if (options.Attachments && options.Attachments.length > 0) {
      emailData.attachments = options.Attachments.map((attachment) => {
        const resendAttachment: any = {
          filename: attachment.Filename,
        };
        
        // Handle content
        if (attachment.Content) {
          // Convert Buffer to base64 string if needed
          if (Buffer.isBuffer(attachment.Content)) {
            resendAttachment.content = attachment.Content.toString("base64");
          } else {
            resendAttachment.content = attachment.Content;
          }
        } else if (attachment.Path) {
          resendAttachment.path = attachment.Path;
        }
        
        // Add content type if provided
        if (attachment.ContentType) {
          resendAttachment.content_type = attachment.ContentType;
        }
        
        return resendAttachment;
      });
    }
    
    // Add custom headers
    if (options.Headers) {
      emailData.headers = options.Headers;
    }
    
    // Add tags (Resend-specific feature)
    if (options.Tags) {
      emailData.tags = Object.entries(options.Tags).map(([key, value]) => ({
        name: key,
        value: value,
      }));
    }
    
    return emailData;
  }
  
  /**
   * Formats a single email address for Resend
   * @param address - Email address to format
   * @returns Formatted email string
   */
  private formatAddress(address: EmailAddress): string {
    if (typeof address === "string") {
      return address;
    }
    
    if (address.Name) {
      return `${address.Name} <${address.Email}>`;
    }
    
    return address.Email;
  }
  
  /**
   * Formats an array of email addresses for Resend
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
    if (error instanceof EmailProviderError || error instanceof EmailSendError) {
      finalError = error;
    } else if (error instanceof Error) {
      // Check if it's a Resend API error
      const resendError = error as any;
      const apiErrorMessage = resendError?.message || errorMessage;
      const apiErrorCode = resendError?.statusCode || resendError?.code;
      
      finalError = new EmailProviderError(
        `${EMAIL_ERROR_MESSAGES.PROVIDER_ERROR}: ${apiErrorMessage}`,
        this.getProviderName(),
        error
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
        Code: "RESEND_ERROR",
        Message: errorMessage,
        StackTrace: errorStack,
      },
    };
  }
  
  //#endregion
}
