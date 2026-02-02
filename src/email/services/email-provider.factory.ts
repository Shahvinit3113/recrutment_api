import { IEmailProvider } from "../interfaces/email-provider.interface";
import { EmailConfig, NodemailerConfig, ResendConfig } from "../config/email-config";
import { NodemailerProvider, ResendProvider } from "./providers";
import { ProviderType } from "../types/enums";
import { EmailConfigurationError } from "../errors";
import { EMAIL_ERROR_MESSAGES } from "../constants/error-messages";

/**
 * Static factory class for creating email provider instances
 * @remarks
 * Implements Factory Pattern for creating appropriate email providers
 * Validates configuration before provider instantiation
 * Following Open/Closed Principle - open for extension, closed for modification
 */
export class EmailProviderFactory {
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
   * Creates an email provider instance based on configuration
   * @param config - Email configuration (NodemailerConfig or ResendConfig)
   * @returns Configured email provider instance
   * @throws {EmailConfigurationError} When configuration is invalid or provider type is not supported
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
   * const provider = EmailProviderFactory.createProvider(config);
   * ```
   */
  static createProvider(config: EmailConfig): IEmailProvider {
    // Validate configuration
    try {
      config.validate();
    } catch (error) {
      // Re-throw configuration errors
      if (error instanceof EmailConfigurationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new EmailConfigurationError(
        `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    
    // Create provider based on type
    switch (config.Provider) {
      case ProviderType.Nodemailer:
        return this.createNodemailerProvider(config as NodemailerConfig);
        
      case ProviderType.Resend:
        return this.createResendProvider(config as ResendConfig);
        
      default:
        throw new EmailConfigurationError(
          `${EMAIL_ERROR_MESSAGES.INVALID_PROVIDER_TYPE}: ${config.Provider}`
        );
    }
  }
  
  //#endregion
  
  //#region Private Static Methods
  
  /**
   * Creates a Nodemailer provider instance
   * @param config - Validated Nodemailer configuration
   * @returns NodemailerProvider instance
   * @throws {EmailConfigurationError} When config is not NodemailerConfig
   */
  private static createNodemailerProvider(config: NodemailerConfig): IEmailProvider {
    // Type guard check
    if (!(config instanceof NodemailerConfig)) {
      throw new EmailConfigurationError(
        "Invalid configuration type for Nodemailer provider"
      );
    }
    
    try {
      return new NodemailerProvider(config);
    } catch (error) {
      throw new EmailConfigurationError(
        `Failed to create Nodemailer provider: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  /**
   * Creates a Resend provider instance
   * @param config - Validated Resend configuration
   * @returns ResendProvider instance
   * @throws {EmailConfigurationError} When config is not ResendConfig
   */
  private static createResendProvider(config: ResendConfig): IEmailProvider {
    // Type guard check
    if (!(config instanceof ResendConfig)) {
      throw new EmailConfigurationError(
        "Invalid configuration type for Resend provider"
      );
    }
    
    try {
      return new ResendProvider(config);
    } catch (error) {
      throw new EmailConfigurationError(
        `Failed to create Resend provider: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  //#endregion
}
