import * as fs from "fs";
import * as path from "path";

/**
 * Template helper class for loading and processing email HTML templates
 * @remarks
 * Provides utility methods to load HTML templates from the templates folder
 * and replace placeholders with actual values
 */
export class TemplateHelper {
  /**
   * Base path to the templates directory
   */
  private static readonly TEMPLATES_PATH = path.join(
    __dirname,
    "..",
    "templates",
  );

  /**
   * Cache for loaded templates to improve performance
   */
  private static templateCache: Map<string, string> = new Map();

  //#region Public Static Methods

  /**
   * Loads an email template by name
   * @param templateName Name of the template file (without .html extension)
   * @param useCache Whether to use cached template (default: true)
   * @returns Template content as string
   * @throws Error if template file doesn't exist or cannot be read
   * @example
   * ```typescript
   * const template = TemplateHelper.loadTemplate("login-notification");
   * ```
   */
  static loadTemplate(templateName: string, useCache: boolean = true): string {
    // Check cache first if enabled
    if (useCache && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(this.TEMPLATES_PATH, `${templateName}.html`);

    // Check if file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `Template '${templateName}' not found at ${templatePath}`,
      );
    }

    try {
      // Read template file
      const templateContent = fs.readFileSync(templatePath, "utf-8");

      // Cache the template if caching is enabled
      if (useCache) {
        this.templateCache.set(templateName, templateContent);
      }

      return templateContent;
    } catch (error) {
      throw new Error(
        `Failed to read template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Loads a template and replaces placeholders with provided values
   * @param templateName Name of the template file (without .html extension)
   * @param variables Object containing key-value pairs for placeholder replacement
   * @returns Processed template with replaced values
   * @example
   * ```typescript
   * const html = TemplateHelper.loadAndReplaceTemplate("login-notification", {
   *   userName: "John Doe",
   *   userEmail: "john@example.com",
   *   loginDate: "January 28, 2026",
   *   loginTime: "10:30 AM",
   *   year: "2026"
   * });
   * ```
   */
  static loadAndReplaceTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const template = this.loadTemplate(templateName);
    return this.replaceVariables(template, variables);
  }

  /**
   * Replaces placeholders in template string with provided values
   * @param template Template string containing placeholders in {{variable}} format
   * @param variables Object containing key-value pairs for replacement
   * @returns Template with replaced values
   * @remarks
   * Placeholders use double curly braces: {{variableName}}
   * Missing variables are left as-is in the template
   * @example
   * ```typescript
   * const html = TemplateHelper.replaceVariables(
   *   "<p>Hello {{name}}!</p>",
   *   { name: "John" }
   * );
   * // Result: "<p>Hello John!</p>"
   * ```
   */
  static replaceVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let processedTemplate = template;

    // Replace each variable
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      processedTemplate = processedTemplate.replace(placeholder, value || "");
    }

    return processedTemplate;
  }

  /**
   * Gets all available template names
   * @returns Array of template names (without .html extension)
   * @example
   * ```typescript
   * const templates = TemplateHelper.getAvailableTemplates();
   * // Result: ["login-notification", "welcome", "password-reset", ...]
   * ```
   */
  static getAvailableTemplates(): string[] {
    try {
      const files = fs.readdirSync(this.TEMPLATES_PATH);
      return files
        .filter((file) => file.endsWith(".html"))
        .map((file) => file.replace(".html", ""));
    } catch (error) {
      console.error("Failed to read templates directory:", error);
      return [];
    }
  }

  /**
   * Checks if a template exists
   * @param templateName Name of the template file (without .html extension)
   * @returns True if template exists, false otherwise
   * @example
   * ```typescript
   * if (TemplateHelper.templateExists("welcome")) {
   *   // Load and use the template
   * }
   * ```
   */
  static templateExists(templateName: string): boolean {
    const templatePath = path.join(this.TEMPLATES_PATH, `${templateName}.html`);
    return fs.existsSync(templatePath);
  }

  /**
   * Clears the template cache
   * @remarks
   * Useful when templates are modified during development
   * @example
   * ```typescript
   * TemplateHelper.clearCache();
   * ```
   */
  static clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Clears a specific template from cache
   * @param templateName Name of the template to remove from cache
   * @example
   * ```typescript
   * TemplateHelper.clearTemplateCache("login-notification");
   * ```
   */
  static clearTemplateCache(templateName: string): void {
    this.templateCache.delete(templateName);
  }

  /**
   * Preloads all templates into cache
   * @remarks
   * Useful for warming up the cache on application startup
   * @example
   * ```typescript
   * TemplateHelper.preloadTemplates();
   * ```
   */
  static preloadTemplates(): void {
    const templates = this.getAvailableTemplates();
    templates.forEach((templateName) => {
      this.loadTemplate(templateName, true);
    });
    console.log(`Preloaded ${templates.length} email templates`);
  }

  /**
   * Validates that a template has all required variables
   * @param templateName Name of the template file
   * @param requiredVariables Array of variable names that must be present
   * @returns Object with validation result and missing variables
   * @example
   * ```typescript
   * const validation = TemplateHelper.validateTemplate(
   *   "login-notification",
   *   ["userName", "userEmail"]
   * );
   * if (!validation.isValid) {
   *   console.error("Missing variables:", validation.missingVariables);
   * }
   * ```
   */
  static validateTemplate(
    templateName: string,
    requiredVariables: string[],
  ): { isValid: boolean; missingVariables: string[] } {
    const template = this.loadTemplate(templateName);
    const missingVariables: string[] = [];

    for (const variable of requiredVariables) {
      const placeholder = `{{${variable}}}`;
      if (!template.includes(placeholder)) {
        missingVariables.push(variable);
      }
    }

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  //#endregion

  //#region Helper Methods for Common Templates

  /**
   * Loads and processes the login notification template
   * @param data Login notification data
   * @returns Processed HTML template
   */
  static getLoginNotificationTemplate(data: {
    userName: string;
    userEmail: string;
    loginDate: string;
    loginTime: string;
    ipAddress?: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("login-notification", {
      userName: data.userName,
      userEmail: data.userEmail,
      loginDate: data.loginDate,
      loginTime: data.loginTime,
      ipAddress: data.ipAddress || "Unknown",
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the welcome template
   * @param data Welcome email data
   * @returns Processed HTML template
   */
  static getWelcomeTemplate(data: {
    userName: string;
    userEmail: string;
    userRole: string;
    joinDate: string;
    loginUrl: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("welcome", {
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: data.userRole,
      joinDate: data.joinDate,
      loginUrl: data.loginUrl,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the password reset template
   * @param data Password reset data
   * @returns Processed HTML template
   */
  static getPasswordResetTemplate(data: {
    userName: string;
    resetUrl: string;
    expiryMinutes: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("password-reset", {
      userName: data.userName,
      resetUrl: data.resetUrl,
      expiryMinutes: data.expiryMinutes,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the application received template
   * @param data Application data
   * @returns Processed HTML template
   */
  static getApplicationReceivedTemplate(data: {
    applicantName: string;
    positionTitle: string;
    department: string;
    applicationId: string;
    submissionDate: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("application-received", {
      applicantName: data.applicantName,
      positionTitle: data.positionTitle,
      department: data.department,
      applicationId: data.applicationId,
      submissionDate: data.submissionDate,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the interview invitation template
   * @param data Interview data
   * @returns Processed HTML template
   */
  static getInterviewInvitationTemplate(data: {
    candidateName: string;
    positionTitle: string;
    interviewDate: string;
    interviewTime: string;
    duration: string;
    location: string;
    interviewer: string;
    contactPhone: string;
    confirmUrl: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("interview-invitation", {
      candidateName: data.candidateName,
      positionTitle: data.positionTitle,
      interviewDate: data.interviewDate,
      interviewTime: data.interviewTime,
      duration: data.duration,
      location: data.location,
      interviewer: data.interviewer,
      contactPhone: data.contactPhone,
      confirmUrl: data.confirmUrl,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the application accepted template
   * @param data Acceptance data
   * @returns Processed HTML template
   */
  static getApplicationAcceptedTemplate(data: {
    candidateName: string;
    positionTitle: string;
    department: string;
    startDate: string;
    employmentType: string;
    onboardingDate: string;
    responseDeadline: string;
    acceptUrl: string;
    hrEmail: string;
    hrPhone: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("application-accepted", {
      candidateName: data.candidateName,
      positionTitle: data.positionTitle,
      department: data.department,
      startDate: data.startDate,
      employmentType: data.employmentType,
      onboardingDate: data.onboardingDate,
      responseDeadline: data.responseDeadline,
      acceptUrl: data.acceptUrl,
      hrEmail: data.hrEmail,
      hrPhone: data.hrPhone,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the application rejected template
   * @param data Rejection data
   * @returns Processed HTML template
   */
  static getApplicationRejectedTemplate(data: {
    candidateName: string;
    positionTitle: string;
    applicationId: string;
    submissionDate: string;
    jobPortalUrl: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("application-rejected", {
      candidateName: data.candidateName,
      positionTitle: data.positionTitle,
      applicationId: data.applicationId,
      submissionDate: data.submissionDate,
      jobPortalUrl: data.jobPortalUrl,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  /**
   * Loads and processes the job notification template
   * @param data Job notification data
   * @returns Processed HTML template
   */
  static getJobNotificationTemplate(data: {
    userName: string;
    positionTitle: string;
    location: string;
    employmentType: string;
    salaryRange: string;
    postedDate: string;
    deadline: string;
    jobDescription: string;
    requirements: string;
    applyUrl: string;
    unsubscribeUrl: string;
    year?: string;
  }): string {
    return this.loadAndReplaceTemplate("job-notification", {
      userName: data.userName,
      positionTitle: data.positionTitle,
      location: data.location,
      employmentType: data.employmentType,
      salaryRange: data.salaryRange,
      postedDate: data.postedDate,
      deadline: data.deadline,
      jobDescription: data.jobDescription,
      requirements: data.requirements,
      applyUrl: data.applyUrl,
      unsubscribeUrl: data.unsubscribeUrl,
      year: data.year || new Date().getFullYear().toString(),
    });
  }

  //#endregion
}
