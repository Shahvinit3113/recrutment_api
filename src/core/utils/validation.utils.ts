/**
 * ============================================================================
 * VALIDATION UTILITY
 * ============================================================================
 * 
 * Central utility for validation operations across the application.
 * Provides reusable validation functions and schema helpers.
 */

import { z, ZodError, ZodSchema } from "zod";

/**
 * Validation result
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/**
 * Format Zod errors into a readable format
 */
export function formatZodErrors(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Validate data and throw on error
 */
export function validateOrThrow<T>(
  schema: ZodSchema<T>,
  data: unknown,
  errorMessage = "Validation failed"
): T {
  const result = validate(schema, data);

  if (!result.success) {
    const error = new Error(errorMessage);
    (error as any).validationErrors = result.errors;
    throw error;
  }

  return result.data!;
}

/**
 * Async validation helper
 */
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const parsed = await schema.parseAsync(data);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
      };
    }
    throw error;
  }
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Check if UUID is valid
 */
export function isValidUUID(uuid: string): boolean {
  const uuidSchema = z.string().uuid();
  return uuidSchema.safeParse(uuid).success;
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Create a partial schema (all fields optional)
 */
export function toPartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  return schema.partial();
}

/**
 * Require at least one field in a partial schema
 */
export function atLeastOne<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return schema.partial().refine(
    (data) => Object.values(data).some((val) => val !== undefined && val !== null),
    { message: "At least one field must be provided" }
  );
}
