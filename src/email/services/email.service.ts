import { EmailConfig } from "../config/email-config";
import { EmailOptions } from "../types/email-options.types";
import { 
  EmailResult, 
  BulkEmailResult, 
  BulkEmailItemResult 
} from "../types/email-result.types";
import { RetryOptions, mergeRetryOptions } from "../types/retry-options.types";
import { extractEmailAddress } from "../types/email-address.types";
import { EmailProviderFactory } from "./email-provider.factory";
import { RetryHandler } from "./retry-handler";
import { EMAIL_ERROR_MESSAGES } from "../constants/error-messages";

/**
 * Static email service wrapper class
 * @remarks
 * Main entry point for email sending operations
 * Implements Strategy Pattern by dynamically selecting provider based on configuration
 * Provides single and bulk email sending with retry logic
 * Following Dependency Inversion Principle - depends on IEmailProvider abstraction
 */
export class EmailService {
  /**
   * Private constructor to prevent instantiation
   * @remarks
   * This is a static utility class and should not be instantiated
   */
  private constructor() {
    // Prevent instantiation
  }
  
  //#region Public Static Methods
  
  /**
   * Sends a single email with optional retry logic
   * @param config - Email provider configuration
   * @param options - Email options (recipients, subject, body, etc.)
   * @param retryOptions - Optional retry configuration
   * @returns Promise resolving to EmailResult with send details
   * @throws {EmailConfigurationError} When configuration is invalid
   * @throws {EmailSendError} When email validation fails
   * @throws {EmailProviderError} When provider encounters an error
   * @throws {EmailRetryExhaustedError} When all retry attempts are exhausted
   * @example
   * ```typescript
   * const config = new NodemailerConfig({
   *   Host: "smtp.gmail.com",
   *   Port: 587,
   *   User: "user@gmail.com",
   *   Password: "password",
   *   From: "noreply@example.com"
   * });
   * 
   * const result = await EmailService.sendSingleEmail(
   *   config,
   *   {
   *     To: ["recipient@example.com"],
   *     Subject: "Test Email",
   *     Html: "<p>Hello World</p>"
   *   },
   *   { MaxAttempts: 3, InitialDelayMs: 1000, BackoffMultiplier: 2 }
   * );
   * ```
   */
  static async sendSingleEmail(
    config: EmailConfig,
    options: EmailOptions,
    retryOptions?: RetryOptions
  ): Promise<EmailResult> {
    // Merge with default retry options
    const finalRetryOptions = mergeRetryOptions(retryOptions);
    
    // Create provider (validates config)
    const provider = EmailProviderFactory.createProvider(config);
    
    // Execute send with retry logic
    const result = await RetryHandler.executeWithRetry(
      async () => {
        // Send email using provider
        const sendResult = await provider.sendEmail(options);
        
        // If send failed, throw error to trigger retry
        if (!sendResult.Success) {
          throw new Error(sendResult.Error || EMAIL_ERROR_MESSAGES.SEND_FAILED);
        }
        
        return sendResult;
      },
      finalRetryOptions
    );
    
    return result;
  }
  
  /**
   * Sends multiple emails in bulk with optional retry logic per email
   * @param config - Email provider configuration
   * @param emailOptions - Array of email options for each email
   * @param retryOptions - Optional retry configuration applied to each email
   * @returns Promise resolving to BulkEmailResult with aggregated results
   * @throws {EmailConfigurationError} When configuration is invalid
   * @remarks
   * Continues sending remaining emails even if some fail
   * Returns detailed results for each email with success/failure status
   * @example
   * ```typescript
   * const config = new ResendConfig({
   *   ApiKey: "re_your_api_key",
   *   From: "noreply@example.com"
   * });
   * 
   * const result = await EmailService.sendBulkEmail(
   *   config,
   *   [
   *     { To: ["user1@example.com"], Subject: "Hello 1", Html: "<p>Message 1</p>" },
   *     { To: ["user2@example.com"], Subject: "Hello 2", Html: "<p>Message 2</p>" }
   *   ],
   *   { MaxAttempts: 2 }
   * );
   * ```
   */
  static async sendBulkEmail(
    config: EmailConfig,
    emailOptions: EmailOptions[],
    retryOptions?: RetryOptions
  ): Promise<BulkEmailResult> {
    const startTime = new Date();
    const startTimeMs = Date.now();
    
    // Validate input
    if (!emailOptions || !Array.isArray(emailOptions) || emailOptions.length === 0) {
      throw new Error("Email options array is required and cannot be empty");
    }
    
    // Merge with default retry options
    const finalRetryOptions = mergeRetryOptions(retryOptions);
    
    // Initialize result tracking
    const results: BulkEmailItemResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    const errorsByType: Record<string, number> = {};
    
    // Process each email
    for (let i = 0; i < emailOptions.length; i++) {
      const emailOption = emailOptions[i];
      
      try {
        // Send single email with retry
        const sendResult = await this.sendSingleEmail(
          config,
          emailOption,
          finalRetryOptions
        );
        
        // Track success/failure
        if (sendResult.Success) {
          successCount++;
        } else {
          failureCount++;
          
          // Track error types
          if (sendResult.Error) {
            errorsByType[sendResult.Error] = (errorsByType[sendResult.Error] || 0) + 1;
          }
        }
        
        // Create bulk item result
        const bulkItemResult: BulkEmailItemResult = {
          ...sendResult,
          Index: i,
          Recipient: this.extractPrimaryRecipient(emailOption),
          Subject: emailOption.Subject,
        };
        
        results.push(bulkItemResult);
      } catch (error) {
        // Handle unexpected errors
        failureCount++;
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        errorsByType[errorMessage] = (errorsByType[errorMessage] || 0) + 1;
        
        const bulkItemResult: BulkEmailItemResult = {
          Success: false,
          SentAt: new Date(),
          Provider: config.Provider,
          RetryAttempts: finalRetryOptions.MaxAttempts,
          Index: i,
          Recipient: this.extractPrimaryRecipient(emailOption),
          Subject: emailOption.Subject,
          Error: errorMessage,
          ErrorDetails: {
            Code: "BULK_SEND_ERROR",
            Message: errorMessage,
            StackTrace: error instanceof Error ? error.stack : undefined,
          },
        };
        
        results.push(bulkItemResult);
      }
    }
    
    // Calculate summary
    const endTime = new Date();
    const durationMs = Date.now() - startTimeMs;
    const totalAttempted = emailOptions.length;
    const allSuccessful = failureCount === 0;
    
    // Build bulk result
    const bulkResult: BulkEmailResult = {
      Success: allSuccessful,
      TotalAttempted: totalAttempted,
      SuccessCount: successCount,
      FailureCount: failureCount,
      StartedAt: startTime,
      CompletedAt: endTime,
      DurationMs: durationMs,
      Results: results,
    };
    
    // Add error summary if there were failures
    if (failureCount > 0) {
      bulkResult.ErrorSummary = {
        TotalErrors: failureCount,
        ErrorsByType: errorsByType,
      };
    }
    
    return bulkResult;
  }
  
  //#endregion
  
  //#region Private Static Methods
  
  /**
   * Extracts the primary recipient email address from email options
   * @param options - Email options
   * @returns Primary recipient email or undefined
   * @remarks
   * Used for tracking in bulk results
   */
  private static extractPrimaryRecipient(options: EmailOptions): string | undefined {
    if (options.To && options.To.length > 0) {
      return extractEmailAddress(options.To[0]) || undefined;
    }
    
    if (options.Cc && options.Cc.length > 0) {
      return extractEmailAddress(options.Cc[0]) || undefined;
    }
    
    if (options.Bcc && options.Bcc.length > 0) {
      return extractEmailAddress(options.Bcc[0]) || undefined;
    }
    
    return undefined;
  }
  
  //#endregion
}
