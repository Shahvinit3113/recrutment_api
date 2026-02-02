# Email Service Documentation

## Overview

A comprehensive, self-contained email service implementation following SOLID principles and the Strategy Pattern. Supports multiple email providers (Nodemailer SMTP and Resend API) with dynamic provider selection, retry logic, and detailed result tracking.

## Features

- ✅ **Strategy Pattern** - Swappable email providers
- ✅ **Dynamic Configuration** - Providers initialized fresh per send operation
- ✅ **Multiple Providers** - Nodemailer (SMTP) and Resend (API)
- ✅ **Single & Bulk Sending** - Send individual or multiple emails
- ✅ **Retry Logic** - Configurable exponential backoff
- ✅ **Validation** - Configuration and email options validation
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Error Handling** - Comprehensive error classes and messages
- ✅ **Zero Dependencies** - Self-contained within email folder (except nodemailer and resend packages)

## Installation

The email service is already integrated into the project. Required packages are already in `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^7.0.12",
    "resend": "^6.8.0"
  },
  "devDependencies": {
    "@types/nodemailer": "^7.0.5"
  }
}
```

## Quick Start

### 1. Using Nodemailer (SMTP)

```typescript
import { EmailService, NodemailerConfig } from "@/email";

// Configure Nodemailer
const config = new NodemailerConfig({
  Host: "smtp.gmail.com",
  Port: 587,
  Secure: false,
  User: "your-email@gmail.com",
  Password: "your-app-password",
  From: "noreply@yourdomain.com",
  FromName: "Your Company",
});

// Send single email
const result = await EmailService.sendSingleEmail(
  config,
  {
    To: ["recipient@example.com"],
    Subject: "Welcome to Our Service",
    Html: "<h1>Welcome!</h1><p>Thank you for signing up.</p>",
    Text: "Welcome! Thank you for signing up.",
  }
);

console.log("Email sent:", result.MessageId);
```

### 2. Using Resend API

```typescript
import { EmailService, ResendConfig } from "@/email";

// Configure Resend
const config = new ResendConfig({
  ApiKey: "re_your_api_key_here",
  From: "onboarding@yourdomain.com",
  FromName: "Your Company",
});

// Send single email
const result = await EmailService.sendSingleEmail(
  config,
  {
    To: ["recipient@example.com"],
    Subject: "Password Reset",
    Html: "<p>Click here to reset your password: <a href='...'>Reset</a></p>",
  }
);

console.log("Email sent:", result.MessageId);
```

## Configuration

### Nodemailer Configuration

```typescript
const config = new NodemailerConfig({
  // Required
  Host: "smtp.gmail.com",              // SMTP server host
  User: "your-email@gmail.com",        // SMTP username
  Password: "your-password",           // SMTP password
  From: "noreply@yourdomain.com",      // From email address
  
  // Optional
  Port: 587,                           // SMTP port (default: 587)
  Secure: false,                       // Use TLS (default: false)
  FromName: "Your Company",            // From display name
  RequireTLS: false,                   // Require TLS (default: false)
  IgnoreTLS: false,                    // Ignore TLS errors (dev only)
  ConnectionTimeoutMs: 30000,          // Connection timeout
  SocketTimeoutMs: 30000,              // Socket timeout
});

// Validate before use (optional - factory does this automatically)
config.validate();
```

### Resend Configuration

```typescript
const config = new ResendConfig({
  // Required
  ApiKey: "re_your_api_key",           // Resend API key (starts with "re_")
  From: "noreply@yourdomain.com",      // From email (must be verified domain)
  
  // Optional
  FromName: "Your Company",            // From display name
  ConnectionTimeoutMs: 30000,          // Connection timeout
  SocketTimeoutMs: 30000,              // Socket timeout
});

// Validate before use (optional - factory does this automatically)
config.validate();
```

## Email Options

```typescript
import { EmailOptions, EmailPriority, AttachmentEncoding } from "@/email";

const emailOptions: EmailOptions = {
  // Recipients (at least one required)
  To: ["user1@example.com", "user2@example.com"],
  Cc: ["manager@example.com"],
  Bcc: ["archive@example.com"],
  
  // Content (at least one required)
  Subject: "Important Update",
  Html: "<h1>Update</h1><p>New features available!</p>",
  Text: "Update: New features available!",
  
  // Optional
  ReplyTo: "support@yourdomain.com",
  Priority: EmailPriority.High,
  
  // Attachments
  Attachments: [
    {
      Filename: "report.pdf",
      Path: "/path/to/report.pdf",
      ContentType: "application/pdf",
    },
    {
      Filename: "logo.png",
      Content: Buffer.from("..."),
      Encoding: AttachmentEncoding.Base64,
      Cid: "logo@company",  // For inline images
    },
  ],
  
  // Custom headers
  Headers: {
    "X-Custom-Header": "value",
    "X-Priority": "1",
  },
  
  // Tags (Resend-specific)
  Tags: {
    category: "marketing",
    campaign: "summer-2026",
  },
};
```

## Sending Emails

### Single Email

```typescript
import { EmailService, NodemailerConfig, RetryOptions } from "@/email";

const config = new NodemailerConfig({...});

// Without retry
const result = await EmailService.sendSingleEmail(config, {
  To: ["user@example.com"],
  Subject: "Test",
  Html: "<p>Test email</p>",
});

// With custom retry options
const retryOptions: RetryOptions = {
  MaxAttempts: 5,
  InitialDelayMs: 2000,
  BackoffMultiplier: 2,
  MaxDelayMs: 30000,
  RetryOnAllErrors: true,
};

const resultWithRetry = await EmailService.sendSingleEmail(
  config,
  emailOptions,
  retryOptions
);

// Check result
if (resultWithRetry.Success) {
  console.log("Email sent successfully!");
  console.log("Message ID:", resultWithRetry.MessageId);
  console.log("Sent at:", resultWithRetry.SentAt);
  console.log("Provider:", resultWithRetry.Provider);
  console.log("Retry attempts:", resultWithRetry.RetryAttempts);
} else {
  console.error("Email failed:", resultWithRetry.Error);
  console.error("Error details:", resultWithRetry.ErrorDetails);
}
```

### Bulk Email

```typescript
import { EmailService, ResendConfig, BulkEmailResult } from "@/email";

const config = new ResendConfig({...});

const emails = [
  {
    To: ["user1@example.com"],
    Subject: "Welcome User 1",
    Html: "<p>Welcome!</p>",
  },
  {
    To: ["user2@example.com"],
    Subject: "Welcome User 2",
    Html: "<p>Welcome!</p>",
  },
  {
    To: ["user3@example.com"],
    Subject: "Welcome User 3",
    Html: "<p>Welcome!</p>",
  },
];

// Send bulk emails
const bulkResult: BulkEmailResult = await EmailService.sendBulkEmail(
  config,
  emails,
  { MaxAttempts: 3 }
);

// Check overall result
console.log("Success:", bulkResult.Success);
console.log("Total attempted:", bulkResult.TotalAttempted);
console.log("Successful:", bulkResult.SuccessCount);
console.log("Failed:", bulkResult.FailureCount);
console.log("Duration:", bulkResult.DurationMs, "ms");

// Check individual results
bulkResult.Results.forEach((result) => {
  console.log(`Email ${result.Index} to ${result.Recipient}:`, result.Success);
  if (!result.Success) {
    console.log(`  Error: ${result.Error}`);
  }
});

// Check error summary
if (bulkResult.ErrorSummary) {
  console.log("Errors by type:", bulkResult.ErrorSummary.ErrorsByType);
}
```

## Dynamic Provider Switching

```typescript
import { EmailService, NodemailerConfig, ResendConfig, ProviderType } from "@/email";

async function sendEmail(useResend: boolean, recipient: string) {
  // Dynamically select provider based on runtime condition
  const config = useResend
    ? new ResendConfig({
        ApiKey: process.env.RESEND_API_KEY!,
        From: "noreply@yourdomain.com",
      })
    : new NodemailerConfig({
        Host: process.env.SMTP_HOST!,
        Port: parseInt(process.env.SMTP_PORT!),
        User: process.env.SMTP_USER!,
        Password: process.env.SMTP_PASSWORD!,
        From: "noreply@yourdomain.com",
      });
  
  // Provider is initialized fresh for this send
  const result = await EmailService.sendSingleEmail(config, {
    To: [recipient],
    Subject: "Dynamic Provider Test",
    Html: "<p>Sent via " + config.Provider + "</p>",
  });
  
  return result;
}
```

## Error Handling

```typescript
import {
  EmailService,
  EmailConfigurationError,
  EmailSendError,
  EmailProviderError,
  EmailRetryExhaustedError,
} from "@/email";

try {
  const result = await EmailService.sendSingleEmail(config, emailOptions);
  
  if (!result.Success) {
    // Handle failed send (after retries)
    console.error("Send failed:", result.Error);
  }
} catch (error) {
  if (error instanceof EmailConfigurationError) {
    // Configuration validation failed
    console.error("Config error:", error.message);
    console.error("Status code:", error.StatusCode); // 400
  } else if (error instanceof EmailRetryExhaustedError) {
    // All retry attempts exhausted
    console.error("Retries exhausted after", error.Attempts, "attempts");
    console.error("Last error:", error.LastError?.message);
  } else if (error instanceof EmailProviderError) {
    // Provider-specific error
    console.error("Provider error:", error.Provider);
    console.error("Message:", error.message);
    console.error("Original error:", error.OriginalError);
  } else if (error instanceof EmailSendError) {
    // Send validation error
    console.error("Send error:", error.message);
  } else {
    // Unexpected error
    console.error("Unexpected error:", error);
  }
}
```

## Retry Configuration

```typescript
import { RetryOptions, createDefaultRetryOptions } from "@/email";

// Default retry options
const defaultRetry = createDefaultRetryOptions();
// {
//   MaxAttempts: 3,
//   InitialDelayMs: 1000,
//   BackoffMultiplier: 2,
//   MaxDelayMs: 30000,
//   RetryOnAllErrors: true
// }

// Custom retry options
const customRetry: RetryOptions = {
  MaxAttempts: 5,              // Retry up to 5 times
  InitialDelayMs: 2000,        // Start with 2 second delay
  BackoffMultiplier: 2,        // Double delay each retry
  MaxDelayMs: 60000,           // Cap at 60 seconds
  RetryOnAllErrors: false,     // Only retry transient errors
};

// Disable retries
const noRetry: RetryOptions = {
  MaxAttempts: 0,
  InitialDelayMs: 0,
  BackoffMultiplier: 1,
};

// Retry delays with default options:
// Attempt 1: 1000ms (1s)
// Attempt 2: 2000ms (2s)
// Attempt 3: 4000ms (4s)
// Total: 3 attempts, 7 seconds of delays
```

## Advanced Usage

### Direct Provider Access

```typescript
import { NodemailerProvider, NodemailerConfig } from "@/email";

// Create and use provider directly (bypass factory)
const config = new NodemailerConfig({...});
config.validate();

const provider = new NodemailerProvider(config);

const result = await provider.sendEmail({
  To: ["user@example.com"],
  Subject: "Direct Provider",
  Html: "<p>Sent directly via provider</p>",
});
```

### Custom Retry Handler

```typescript
import { RetryHandler } from "@/email";

// Use retry handler for any operation
const result = await RetryHandler.executeWithRetry(
  async () => {
    // Your custom operation
    return await someAsyncOperation();
  },
  {
    MaxAttempts: 3,
    InitialDelayMs: 1000,
    BackoffMultiplier: 2,
  }
);
```

### Email Address Formats

```typescript
import { EmailAddress } from "@/email";

// Simple string format
const simple: EmailAddress = "user@example.com";

// Named format
const named: EmailAddress = {
  Email: "user@example.com",
  Name: "John Doe",
};

// Use in email options
const emailOptions = {
  To: [
    "simple@example.com",
    { Email: "john@example.com", Name: "John Doe" },
  ],
  Subject: "Mixed Formats",
  Html: "<p>Email</p>",
};
```

## Best Practices

1. **Configuration Validation**
   - Configuration is automatically validated by the factory
   - Manually call `config.validate()` for early error detection

2. **Error Handling**
   - Always wrap email sends in try-catch
   - Check `result.Success` even without exceptions
   - Log `result.ErrorDetails` for debugging

3. **Retry Configuration**
   - Use default retry options for most cases
   - Set `MaxAttempts: 0` for time-sensitive emails
   - Set `RetryOnAllErrors: false` for better control

4. **Provider Selection**
   - Use Nodemailer for self-hosted SMTP
   - Use Resend for modern API-based sending
   - Create new config per send for dynamic switching

5. **Bulk Sending**
   - Use `sendBulkEmail` for multiple recipients
   - Monitor `BulkEmailResult.ErrorSummary` for patterns
   - Consider implementing rate limiting for large batches

6. **Security**
   - Never hardcode credentials
   - Use environment variables for sensitive data
   - Set `IgnoreTLS: false` in production

## Type Exports

```typescript
// All available exports
import {
  // Main Service
  EmailService,
  
  // Configuration
  EmailConfig,
  NodemailerConfig,
  ResendConfig,
  
  // Types
  EmailOptions,
  EmailResult,
  BulkEmailResult,
  BulkEmailItemResult,
  EmailAddress,
  EmailAttachment,
  RetryOptions,
  
  // Enums
  ProviderType,
  EmailPriority,
  AttachmentEncoding,
  
  // Errors
  EmailConfigurationError,
  EmailSendError,
  EmailProviderError,
  EmailRetryExhaustedError,
  
  // Constants
  EMAIL_ERROR_MESSAGES,
  EMAIL_ERROR_CODES,
  EMAIL_DEFAULTS,
  
  // Interfaces
  IEmailProvider,
  
  // Advanced
  EmailProviderFactory,
  RetryHandler,
  NodemailerProvider,
  ResendProvider,
} from "@/email";
```

## Architecture

```
email/
├── config/                 # Configuration classes
│   ├── email-config.ts    # Abstract base + Nodemailer + Resend configs
│   └── index.ts
├── constants/             # Constants and error messages
│   └── error-messages.ts
├── errors/                # Custom error classes
│   ├── email-configuration.error.ts
│   ├── email-send.error.ts
│   ├── email-provider.error.ts
│   ├── email-retry-exhausted.error.ts
│   └── index.ts
├── interfaces/            # Provider interface
│   ├── email-provider.interface.ts
│   └── index.ts
├── services/              # Service implementations
│   ├── providers/
│   │   ├── nodemailer-provider.service.ts
│   │   ├── resend-provider.service.ts
│   │   └── index.ts
│   ├── email.service.ts           # Main service wrapper
│   ├── email-provider.factory.ts  # Provider factory
│   ├── retry-handler.ts           # Retry logic
│   └── index.ts
├── types/                 # Type definitions
│   ├── enums.ts
│   ├── email-address.types.ts
│   ├── email-options.types.ts
│   ├── email-result.types.ts
│   ├── retry-options.types.ts
│   └── index.ts
└── index.ts               # Main barrel export
```

## SOLID Principles Applied

- **Single Responsibility**: Each class has one job (provider, factory, retry handler, etc.)
- **Open/Closed**: Easy to add new providers without modifying existing code
- **Liskov Substitution**: All providers implement IEmailProvider and are interchangeable
- **Interface Segregation**: Small, focused interfaces (IEmailProvider)
- **Dependency Inversion**: Service depends on IEmailProvider abstraction, not concrete providers

## License

Internal use within the recruitment API project.
