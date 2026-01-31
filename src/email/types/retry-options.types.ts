/**
 * Retry configuration for email sending operations
 * @remarks
 * Configures exponential backoff retry logic for failed email sends
 * All properties have defaults and can be partially specified
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   * @remarks
   * Set to 0 to disable retries
   */
  MaxAttempts?: number;
  
  /**
   * Initial delay between retries in milliseconds
   * @default 1000
   */
  InitialDelayMs?: number;
  
  /**
   * Multiplier for exponential backoff
   * @default 2
   * @remarks
   * Each retry delay is calculated as: InitialDelayMs * (BackoffMultiplier ^ attemptNumber)
   * Example with InitialDelayMs=1000, BackoffMultiplier=2:
   * - Attempt 1: 1000ms
   * - Attempt 2: 2000ms
   * - Attempt 3: 4000ms
   */
  BackoffMultiplier?: number;
  
  /**
   * Maximum delay between retries in milliseconds
   * @default 30000
   * @remarks
   * Caps the exponential backoff to prevent excessive delays
   */
  MaxDelayMs?: number;
  
  /**
   * Whether to retry on all errors or only specific ones
   * @default true
   * @remarks
   * If false, only retries on transient errors (network, timeout, etc.)
   */
  RetryOnAllErrors?: boolean;
}

/**
 * Creates default retry options
 * @returns Default RetryOptions with standard values
 */
export function createDefaultRetryOptions(): Required<RetryOptions> {
  return {
    MaxAttempts: 3,
    InitialDelayMs: 1000,
    BackoffMultiplier: 2,
    MaxDelayMs: 30000,
    RetryOnAllErrors: true,
  };
}

/**
 * Merges partial retry options with defaults
 * @param options - Partial retry options
 * @returns Complete RetryOptions with defaults applied
 */
export function mergeRetryOptions(options?: RetryOptions): Required<RetryOptions> {
  const defaults = createDefaultRetryOptions();
  
  if (!options) {
    return defaults;
  }
  
  return {
    MaxAttempts: options.MaxAttempts ?? defaults.MaxAttempts,
    InitialDelayMs: options.InitialDelayMs ?? defaults.InitialDelayMs,
    BackoffMultiplier: options.BackoffMultiplier ?? defaults.BackoffMultiplier,
    MaxDelayMs: options.MaxDelayMs ?? defaults.MaxDelayMs,
    RetryOnAllErrors: options.RetryOnAllErrors ?? defaults.RetryOnAllErrors,
  };
}

/**
 * Calculates the delay for a specific retry attempt
 * @param attemptNumber - Current retry attempt number (1-based)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  attemptNumber: number,
  options: Required<RetryOptions>
): number {
  const delay = options.InitialDelayMs * Math.pow(options.BackoffMultiplier, attemptNumber - 1);
  
  if (options.MaxDelayMs) {
    return Math.min(delay, options.MaxDelayMs);
  }
  
  return delay;
}

/**
 * Validates retry options
 * @param options - Retry options to validate
 * @returns True if options are valid
 */
export function validateRetryOptions(options?: RetryOptions): boolean {
  if (!options) {
    return true; // Optional parameter
  }
  
  if (options.MaxAttempts !== undefined && 
      (typeof options.MaxAttempts !== "number" || options.MaxAttempts < 0)) {
    return false;
  }
  
  if (options.InitialDelayMs !== undefined && 
      (typeof options.InitialDelayMs !== "number" || options.InitialDelayMs <= 0)) {
    return false;
  }
  
  if (options.BackoffMultiplier !== undefined && 
      (typeof options.BackoffMultiplier !== "number" || options.BackoffMultiplier <= 0)) {
    return false;
  }
  
  if (options.MaxDelayMs !== undefined && 
      (typeof options.MaxDelayMs !== "number" || options.MaxDelayMs <= 0)) {
    return false;
  }
  
  return true;
}
