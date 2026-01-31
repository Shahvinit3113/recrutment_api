/**
 * Result of a single email send operation
 * @remarks
 * Contains detailed information about the send operation including success status and metadata
 */
export interface EmailResult {
  /**
   * Whether the email was sent successfully
   */
  Success: boolean;
  
  /**
   * Message ID assigned by the email provider
   * @remarks
   * Can be used for tracking and debugging
   */
  MessageId?: string;
  
  /**
   * Timestamp when the email was sent
   */
  SentAt: Date;
  
  /**
   * Email provider used for sending
   */
  Provider: string;
  
  /**
   * Number of retry attempts made
   * @default 0
   */
  RetryAttempts: number;
  
  /**
   * Error message if sending failed
   */
  Error?: string;
  
  /**
   * Detailed error information
   */
  ErrorDetails?: {
    /**
     * Error code from provider
     */
    Code?: string;
    
    /**
     * Error message from provider
     */
    Message?: string;
    
    /**
     * Stack trace for debugging
     */
    StackTrace?: string;
  };
  
  /**
   * Additional metadata from the provider
   */
  Metadata?: Record<string, any>;
}

/**
 * Result of a single email in a bulk send operation
 * @remarks
 * Extends EmailResult with recipient information for tracking
 */
export interface BulkEmailItemResult extends EmailResult {
  /**
   * Index of the email in the bulk send array
   */
  Index: number;
  
  /**
   * Recipient email address (primary To address)
   */
  Recipient?: string;
  
  /**
   * Email subject for reference
   */
  Subject?: string;
}

/**
 * Result of a bulk email send operation
 * @remarks
 * Aggregates results from multiple email send operations
 */
export interface BulkEmailResult {
  /**
   * Whether all emails were sent successfully
   */
  Success: boolean;
  
  /**
   * Total number of emails attempted
   */
  TotalAttempted: number;
  
  /**
   * Number of emails sent successfully
   */
  SuccessCount: number;
  
  /**
   * Number of emails that failed to send
   */
  FailureCount: number;
  
  /**
   * Timestamp when the bulk send operation started
   */
  StartedAt: Date;
  
  /**
   * Timestamp when the bulk send operation completed
   */
  CompletedAt: Date;
  
  /**
   * Total duration in milliseconds
   */
  DurationMs: number;
  
  /**
   * Individual results for each email
   */
  Results: BulkEmailItemResult[];
  
  /**
   * Summary of errors encountered
   */
  ErrorSummary?: {
    /**
     * Total number of errors
     */
    TotalErrors: number;
    
    /**
     * Grouped errors by error message
     */
    ErrorsByType: Record<string, number>;
  };
}
