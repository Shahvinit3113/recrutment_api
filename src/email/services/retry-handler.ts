import { 
  RetryOptions, 
  createDefaultRetryOptions,
  mergeRetryOptions,
  calculateRetryDelay,
  validateRetryOptions 
} from "../types/retry-options.types";
import { EmailRetryExhaustedError } from "../errors";
import { EMAIL_ERROR_MESSAGES } from "../constants/error-messages";

/**
 * Static utility class for handling retry logic with exponential backoff
 * @remarks
 * Implements configurable retry mechanism for email sending operations
 * Uses exponential backoff strategy to avoid overwhelming providers
 */
export class RetryHandler {
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
   * Executes an operation with retry logic and exponential backoff
   * @param operation - Async operation to execute
   * @param options - Retry configuration options
   * @returns Promise resolving to operation result
   * @throws {EmailRetryExhaustedError} When all retry attempts are exhausted
   * @example
   * ```typescript
   * const result = await RetryHandler.executeWithRetry(
   *   async () => provider.sendEmail(options),
   *   { MaxAttempts: 3, InitialDelayMs: 1000, BackoffMultiplier: 2 }
   * );
   * ```
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    // Merge with default options
    const retryOptions = mergeRetryOptions(options);
    
    // Validate retry options
    if (!validateRetryOptions(retryOptions)) {
      throw new Error(EMAIL_ERROR_MESSAGES.INVALID_RETRY_ATTEMPTS);
    }
    
    // If MaxAttempts is 0, execute without retry
    if (retryOptions.MaxAttempts === 0) {
      return await operation();
    }
    
    let lastError: Error | undefined;
    let attempt = 0;
    
    // Try initial attempt + retries
    while (attempt <= retryOptions.MaxAttempts) {
      try {
        attempt++;
        
        // Execute the operation
        const result = await operation();
        
        // Success - return result
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        const shouldRetry = this.shouldRetryError(error, retryOptions);
        const hasAttemptsLeft = attempt <= retryOptions.MaxAttempts;
        
        if (!shouldRetry || !hasAttemptsLeft) {
          // No more retries or shouldn't retry this error
          break;
        }
        
        // Calculate delay for next retry
        const delay = calculateRetryDelay(attempt, retryOptions);
        
        // Wait before next retry
        await this.sleep(delay);
      }
    }
    
    // All attempts exhausted - throw retry exhausted error
    throw new EmailRetryExhaustedError(attempt - 1, lastError);
  }
  
  /**
   * Determines if an error should trigger a retry
   * @param error - Error to evaluate
   * @param options - Retry configuration options
   * @returns True if the error should trigger a retry
   */
  static shouldRetryError(error: unknown, options: RetryOptions): boolean {
    // If RetryOnAllErrors is true, always retry
    if (options.RetryOnAllErrors) {
      return true;
    }
    
    // Otherwise, only retry on transient errors
    return this.isTransientError(error);
  }
  
  /**
   * Determines if an error is transient (temporary) and worth retrying
   * @param error - Error to evaluate
   * @returns True if the error is likely transient
   * @remarks
   * Transient errors include:
   * - Network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, etc.)
   * - Timeout errors
   * - 5xx server errors
   * - Rate limit errors (429)
   */
  static isTransientError(error: unknown): boolean {
    if (!error) {
      return false;
    }
    
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorCode = (error as any)?.code?.toUpperCase();
    const statusCode = (error as any)?.statusCode || (error as any)?.status;
    
    // Network errors
    const networkErrorCodes = [
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ENETUNREACH",
      "EAI_AGAIN",
      "ESOCKETTIMEDOUT",
    ];
    
    if (errorCode && networkErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Timeout errors
    if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      return true;
    }
    
    // 5xx server errors (temporary server issues)
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return true;
    }
    
    // 429 rate limit errors
    if (statusCode === 429) {
      return true;
    }
    
    // Connection errors
    if (errorMessage.includes("connection") || 
        errorMessage.includes("socket") ||
        errorMessage.includes("network")) {
      return true;
    }
    
    return false;
  }
  
  //#endregion
  
  //#region Private Static Methods
  
  /**
   * Pauses execution for specified duration
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the specified duration
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  //#endregion
}
