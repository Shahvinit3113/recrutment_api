/**
 * Email Service Usage Examples
 * @remarks
 * Practical examples showing how to use the email service in the recruitment API
 */

import { 
  EmailService, 
  NodemailerConfig, 
  ResendConfig,
  EmailOptions,
  RetryOptions,
  EmailPriority,
  ProviderType 
} from "./index";

//#region Configuration Examples

/**
 * Example: Create Nodemailer configuration from environment variables
 */
export function createNodemailerConfigFromEnv(): NodemailerConfig {
  return new NodemailerConfig({
    Host: process.env.SMTP_HOST || "smtp.gmail.com",
    Port: parseInt(process.env.SMTP_PORT || "587"),
    Secure: process.env.SMTP_SECURE === "true",
    User: process.env.SMTP_USER || "",
    Password: process.env.SMTP_PASSWORD || "",
    From: process.env.SMTP_FROM || "noreply@yourdomain.com",
    FromName: process.env.SMTP_FROM_NAME || "Recruitment System",
  });
}

/**
 * Example: Create Resend configuration from environment variables
 */
export function createResendConfigFromEnv(): ResendConfig {
  return new ResendConfig({
    ApiKey: process.env.RESEND_API_KEY || "",
    From: process.env.RESEND_FROM || "noreply@yourdomain.com",
    FromName: process.env.RESEND_FROM_NAME || "Recruitment System",
  });
}

/**
 * Example: Dynamic provider selection based on environment
 */
export function createEmailConfig(): NodemailerConfig | ResendConfig {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "nodemailer";
  
  if (provider === "resend") {
    return createResendConfigFromEnv();
  }
  
  return createNodemailerConfigFromEnv();
}

//#endregion

//#region Single Email Examples

/**
 * Example: Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const config = createEmailConfig();
  
  const emailOptions: EmailOptions = {
    To: [{ Email: userEmail, Name: userName }],
    Subject: "Welcome to Recruitment System",
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Welcome, ${userName}!</h1>
        <p>Thank you for joining our recruitment system.</p>
        <p>Get started by completing your profile.</p>
        <br>
        <p>Best regards,<br>The Recruitment Team</p>
      </div>
    `,
    Text: `Welcome, ${userName}! Thank you for joining our recruitment system.`,
  };
  
  try {
    const result = await EmailService.sendSingleEmail(config, emailOptions);
    
    if (result.Success) {
      console.log(`Welcome email sent to ${userEmail} - Message ID: ${result.MessageId}`);
      return { success: true, messageId: result.MessageId };
    } else {
      console.error(`Failed to send welcome email: ${result.Error}`);
      return { success: false, error: result.Error };
    }
  } catch (error) {
    console.error("Welcome email error:", error);
    throw error;
  }
}

/**
 * Example: Send password reset email with retry
 */
export async function sendPasswordResetEmail(
  userEmail: string, 
  resetToken: string,
  resetUrl: string
) {
  const config = createEmailConfig();
  
  const emailOptions: EmailOptions = {
    To: [userEmail],
    Subject: "Password Reset Request",
    Priority: EmailPriority.High,
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    Text: `Password reset requested. Visit: ${resetUrl}`,
  };
  
  // Critical email - use aggressive retry
  const retryOptions: RetryOptions = {
    MaxAttempts: 5,
    InitialDelayMs: 1000,
    BackoffMultiplier: 2,
    MaxDelayMs: 30000,
    RetryOnAllErrors: true,
  };
  
  const result = await EmailService.sendSingleEmail(
    config, 
    emailOptions, 
    retryOptions
  );
  
  return result;
}

/**
 * Example: Send application status update
 */
export async function sendApplicationStatusEmail(
  applicantEmail: string,
  applicantName: string,
  positionTitle: string,
  status: string
) {
  const config = createEmailConfig();
  
  const statusMessages: Record<string, { subject: string; message: string }> = {
    received: {
      subject: "Application Received",
      message: "We have received your application and will review it shortly.",
    },
    reviewed: {
      subject: "Application Under Review",
      message: "Your application is currently being reviewed by our team.",
    },
    interview: {
      subject: "Interview Invitation",
      message: "Congratulations! We would like to invite you for an interview.",
    },
    accepted: {
      subject: "Application Accepted",
      message: "We are pleased to inform you that your application has been accepted!",
    },
    rejected: {
      subject: "Application Status Update",
      message: "Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.",
    },
  };
  
  const statusInfo = statusMessages[status.toLowerCase()] || {
    subject: "Application Status Update",
    message: "Your application status has been updated.",
  };
  
  const result = await EmailService.sendSingleEmail(config, {
    To: [{ Email: applicantEmail, Name: applicantName }],
    Subject: `${statusInfo.subject} - ${positionTitle}`,
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${applicantName},</h2>
        <p>${statusInfo.message}</p>
        <p><strong>Position:</strong> ${positionTitle}</p>
        <br>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
  });
  
  return result;
}

//#endregion

//#region Bulk Email Examples

/**
 * Example: Send bulk interview invitations
 */
export async function sendBulkInterviewInvitations(
  candidates: Array<{
    email: string;
    name: string;
    position: string;
    interviewDate: Date;
    interviewLocation: string;
  }>
) {
  const config = createEmailConfig();
  
  const emailOptions: EmailOptions[] = candidates.map((candidate) => ({
    To: [{ Email: candidate.email, Name: candidate.name }],
    Subject: `Interview Invitation - ${candidate.position}`,
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Interview Invitation</h2>
        <p>Dear ${candidate.name},</p>
        <p>We are pleased to invite you for an interview for the position of <strong>${candidate.position}</strong>.</p>
        <p><strong>Date & Time:</strong> ${candidate.interviewDate.toLocaleString()}</p>
        <p><strong>Location:</strong> ${candidate.interviewLocation}</p>
        <p>Please confirm your attendance by replying to this email.</p>
        <br>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    Priority: EmailPriority.High,
  }));
  
  const bulkResult = await EmailService.sendBulkEmail(
    config,
    emailOptions,
    { MaxAttempts: 3, InitialDelayMs: 1000, BackoffMultiplier: 2 }
  );
  
  console.log(`Bulk send completed: ${bulkResult.SuccessCount}/${bulkResult.TotalAttempted} successful`);
  
  if (bulkResult.FailureCount > 0) {
    console.error("Failed emails:", bulkResult.ErrorSummary);
    
    // Log individual failures
    bulkResult.Results.filter(r => !r.Success).forEach(result => {
      console.error(`Failed to send to ${result.Recipient}: ${result.Error}`);
    });
  }
  
  return bulkResult;
}

/**
 * Example: Send monthly newsletter to all users
 */
export async function sendMonthlyNewsletter(
  subscribers: Array<{ email: string; name: string }>,
  newsletterContent: string
) {
  const config = createEmailConfig();
  
  const emailOptions: EmailOptions[] = subscribers.map((subscriber) => ({
    To: [{ Email: subscriber.email, Name: subscriber.name }],
    Subject: "Monthly Newsletter - Recruitment Updates",
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Monthly Newsletter</h1>
        <p>Hello ${subscriber.name},</p>
        ${newsletterContent}
        <hr>
        <p style="font-size: 12px; color: #666;">
          You are receiving this because you subscribed to our newsletter.
          <a href="#">Unsubscribe</a>
        </p>
      </div>
    `,
    Tags: {
      type: "newsletter",
      month: new Date().toISOString().slice(0, 7),
    },
  }));
  
  return await EmailService.sendBulkEmail(config, emailOptions);
}

//#endregion

//#region Advanced Examples

/**
 * Example: Send email with attachment
 */
export async function sendApplicationConfirmationWithReceipt(
  applicantEmail: string,
  applicantName: string,
  pdfReceipt: Buffer
) {
  const config = createEmailConfig();
  
  const result = await EmailService.sendSingleEmail(config, {
    To: [{ Email: applicantEmail, Name: applicantName }],
    Subject: "Application Confirmation",
    Html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Application Submitted Successfully</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application has been submitted successfully.</p>
        <p>Please find attached your application receipt for your records.</p>
      </div>
    `,
    Attachments: [
      {
        Filename: "application-receipt.pdf",
        Content: pdfReceipt,
        ContentType: "application/pdf",
      },
    ],
  });
  
  return result;
}

/**
 * Example: Conditional provider selection
 */
export async function sendUrgentNotification(
  recipientEmail: string,
  subject: string,
  message: string
) {
  // Use Resend for urgent emails (faster API), fallback to SMTP
  let config = createEmailConfig();
  
  // Try Resend first if available
  if (process.env.RESEND_API_KEY) {
    config = createResendConfigFromEnv();
  }
  
  const result = await EmailService.sendSingleEmail(
    config,
    {
      To: [recipientEmail],
      Subject: subject,
      Html: `<div style="color: red; font-weight: bold;">${message}</div>`,
      Priority: EmailPriority.High,
    },
    { MaxAttempts: 5, InitialDelayMs: 500, BackoffMultiplier: 2 }
  );
  
  return result;
}

/**
 * Example: Error handling with fallback
 */
export async function sendCriticalEmailWithFallback(
  recipientEmail: string,
  subject: string,
  htmlContent: string
) {
  const emailOptions: EmailOptions = {
    To: [recipientEmail],
    Subject: subject,
    Html: htmlContent,
  };
  
  // Try primary provider
  try {
    const primaryConfig = createResendConfigFromEnv();
    const result = await EmailService.sendSingleEmail(
      primaryConfig,
      emailOptions,
      { MaxAttempts: 2 }
    );
    
    if (result.Success) {
      return { success: true, provider: "Resend", messageId: result.MessageId };
    }
  } catch (error) {
    console.warn("Primary provider failed, trying fallback:", error);
  }
  
  // Fallback to secondary provider
  try {
    const fallbackConfig = createNodemailerConfigFromEnv();
    const result = await EmailService.sendSingleEmail(
      fallbackConfig,
      emailOptions,
      { MaxAttempts: 3 }
    );
    
    if (result.Success) {
      return { success: true, provider: "Nodemailer", messageId: result.MessageId };
    }
    
    return { success: false, error: result.Error };
  } catch (error) {
    console.error("All providers failed:", error);
    return { success: false, error: String(error) };
  }
}

//#endregion

//#region Helper Functions

/**
 * Example: Email validation helper
 */
export function isValidEmailAddress(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Example: Batch processing helper
 */
export async function sendEmailsInBatches(
  emails: EmailOptions[],
  batchSize: number = 50
) {
  const config = createEmailConfig();
  const results = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
    
    const batchResult = await EmailService.sendBulkEmail(config, batch);
    results.push(batchResult);
    
    // Small delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

//#endregion
