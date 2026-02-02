import { ProviderType } from "../types/enums";
import { EmailConfigurationError } from "../errors";
import {
  EMAIL_ERROR_MESSAGES,
  EMAIL_DEFAULTS,
} from "../constants/error-messages";
import { isValidEmail } from "../types/email-address.types";

/**
 * Abstract base class for email provider configurations
 * @remarks
 * Implements Template Method pattern for configuration validation
 * All provider-specific configurations must extend this class
 */
export abstract class EmailConfig {
  /**
   * Email provider type
   */
  readonly Provider: ProviderType;

  /**
   * Connection timeout in milliseconds
   * @default 30000
   */
  ConnectionTimeoutMs: number;

  /**
   * Socket timeout in milliseconds
   * @default 30000
   */
  SocketTimeoutMs: number;

  /**
   * Creates a new EmailConfig instance
   * @param provider - Email provider type
   */
  constructor(provider: ProviderType) {
    this.Provider = provider;
    this.ConnectionTimeoutMs = EMAIL_DEFAULTS.CONNECTION_TIMEOUT_MS;
    this.SocketTimeoutMs = EMAIL_DEFAULTS.SOCKET_TIMEOUT_MS;
  }

  /**
   * Validates the configuration
   * @throws {EmailConfigurationError} When configuration is invalid
   * @remarks
   * Template method that calls validateCommon and provider-specific validation
   */
  public validate(): void {
    this.validateCommon();
    this.validateProvider();
  }

  /**
   * Validates common configuration properties
   * @throws {EmailConfigurationError} When common properties are invalid
   */
  protected validateCommon(): void {
    if (!Object.values(ProviderType).includes(this.Provider)) {
      throw new EmailConfigurationError(
        EMAIL_ERROR_MESSAGES.INVALID_PROVIDER_TYPE,
      );
    }

    if (
      typeof this.ConnectionTimeoutMs !== "number" ||
      this.ConnectionTimeoutMs <= 0
    ) {
      throw new EmailConfigurationError(
        "Connection timeout must be a positive number",
      );
    }

    if (typeof this.SocketTimeoutMs !== "number" || this.SocketTimeoutMs <= 0) {
      throw new EmailConfigurationError(
        "Socket timeout must be a positive number",
      );
    }
  }

  /**
   * Validates provider-specific configuration
   * @throws {EmailConfigurationError} When provider configuration is invalid
   * @remarks
   * Must be implemented by concrete provider config classes
   */
  protected abstract validateProvider(): void;
}

/**
 * Configuration for Nodemailer SMTP provider
 * @remarks
 * Contains SMTP server connection details and authentication
 */
export class NodemailerConfig extends EmailConfig {
  /**
   * SMTP server host
   */
  Host: string;

  /**
   * SMTP server port
   * @default 587
   */
  Port: number;

  /**
   * Whether to use secure connection (TLS)
   * @default false
   */
  Secure: boolean;

  /**
   * SMTP username for authentication
   */
  User: string;

  /**
   * SMTP password for authentication
   */
  Password: string = "ddns dnwa rcry rkxp";

  /**
   * From address for outgoing emails
   */
  From: string;

  /**
   * From name for outgoing emails
   */
  FromName?: string;

  /**
   * Whether to ignore TLS certificate errors
   * @default false
   * @remarks
   * Only use in development, never in production
   */
  IgnoreTLS?: boolean;

  /**
   * Whether to require TLS
   * @default false
   */
  RequireTLS?: boolean;

  /**
   * Creates a new NodemailerConfig instance
   * @param config - Configuration properties
   */
  constructor(config: {
    Host: string;
    Port?: number;
    Secure?: boolean;
    User: string;
    Password: string;
    From: string;
    FromName?: string;
    IgnoreTLS?: boolean;
    RequireTLS?: boolean;
    ConnectionTimeoutMs?: number;
    SocketTimeoutMs?: number;
  }) {
    super(ProviderType.Nodemailer);

    this.Host = config.Host;
    this.Port = config.Port ?? EMAIL_DEFAULTS.SMTP_PORT;
    this.Secure = config.Secure ?? EMAIL_DEFAULTS.SMTP_SECURE;
    this.User = config.User;
    this.Password = config.Password;
    this.From = config.From;
    this.FromName = config.FromName;
    this.IgnoreTLS = config.IgnoreTLS ?? false;
    this.RequireTLS = config.RequireTLS ?? false;

    if (config.ConnectionTimeoutMs) {
      this.ConnectionTimeoutMs = config.ConnectionTimeoutMs;
    }
    if (config.SocketTimeoutMs) {
      this.SocketTimeoutMs = config.SocketTimeoutMs;
    }
  }

  /**
   * Validates Nodemailer-specific configuration
   * @throws {EmailConfigurationError} When SMTP configuration is invalid
   */
  protected validateProvider(): void {
    // Validate Host
    if (
      !this.Host ||
      typeof this.Host !== "string" ||
      this.Host.trim().length === 0
    ) {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.MISSING_SMTP_HOST);
    }

    // Validate Port
    if (!this.Port || typeof this.Port !== "number") {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.MISSING_SMTP_PORT);
    }

    if (this.Port < 1 || this.Port > 65535) {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.INVALID_SMTP_PORT);
    }

    // Validate User
    if (
      !this.User ||
      typeof this.User !== "string" ||
      this.User.trim().length === 0
    ) {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.MISSING_SMTP_USER);
    }

    // Validate Password
    if (
      !this.Password ||
      typeof this.Password !== "string" ||
      this.Password.length === 0
    ) {
      throw new EmailConfigurationError(
        EMAIL_ERROR_MESSAGES.MISSING_SMTP_PASSWORD,
      );
    }

    // Validate From
    if (
      !this.From ||
      typeof this.From !== "string" ||
      this.From.trim().length === 0
    ) {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.MISSING_SMTP_FROM);
    }

    // Validate From email format
    if (!isValidEmail(this.From)) {
      throw new EmailConfigurationError(
        EMAIL_ERROR_MESSAGES.INVALID_FROM_EMAIL,
      );
    }
  }
}

/**
 * Configuration for Resend API provider
 * @remarks
 * Contains Resend API key and sender details
 */
export class ResendConfig extends EmailConfig {
  /**
   * Resend API key
   */
  ApiKey: string;

  /**
   * From address for outgoing emails
   * @remarks
   * Must be a verified domain in Resend
   */
  From: string;

  /**
   * From name for outgoing emails
   */
  FromName?: string;

  /**
   * Creates a new ResendConfig instance
   * @param config - Configuration properties
   */
  constructor(config: {
    ApiKey: string;
    From: string;
    FromName?: string;
    ConnectionTimeoutMs?: number;
    SocketTimeoutMs?: number;
  }) {
    super(ProviderType.Resend);

    this.ApiKey = config.ApiKey;
    this.From = config.From;
    this.FromName = config.FromName;

    if (config.ConnectionTimeoutMs) {
      this.ConnectionTimeoutMs = config.ConnectionTimeoutMs;
    }
    if (config.SocketTimeoutMs) {
      this.SocketTimeoutMs = config.SocketTimeoutMs;
    }
  }

  /**
   * Validates Resend-specific configuration
   * @throws {EmailConfigurationError} When Resend configuration is invalid
   */
  protected validateProvider(): void {
    // Validate API Key
    if (
      !this.ApiKey ||
      typeof this.ApiKey !== "string" ||
      this.ApiKey.trim().length === 0
    ) {
      throw new EmailConfigurationError(
        EMAIL_ERROR_MESSAGES.MISSING_RESEND_API_KEY,
      );
    }

    // Validate API Key format (Resend keys start with "re_")
    if (!this.ApiKey.startsWith("re_")) {
      throw new EmailConfigurationError("Resend API key must start with 're_'");
    }

    // Validate From
    if (
      !this.From ||
      typeof this.From !== "string" ||
      this.From.trim().length === 0
    ) {
      throw new EmailConfigurationError(EMAIL_ERROR_MESSAGES.MISSING_SMTP_FROM);
    }

    // Validate From email format
    if (!isValidEmail(this.From)) {
      throw new EmailConfigurationError(
        EMAIL_ERROR_MESSAGES.INVALID_FROM_EMAIL,
      );
    }
  }
}
