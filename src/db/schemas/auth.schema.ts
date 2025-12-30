import { z } from "zod";
import { emailSchema, nonEmptyString } from "@/core/validation/schemas";

/**
 * ============================================================================
 * AUTH VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Login schema
 */
export const LoginSchema = z.object({
  Email: emailSchema,
  Password: z.string().min(1, "Password is required"),
});

/**
 * Refresh token schema
 */
export const RefreshTokenSchema = z.object({
  RefreshToken: nonEmptyString,
});

/**
 * Register schema (if you have registration)
 */
export const RegisterSchema = z.object({
  Email: emailSchema,
  Password: z.string().min(8, "Password must be at least 8 characters"),
  FirstName: nonEmptyString.max(100),
  LastName: nonEmptyString.max(100),
});

// Type exports
export type LoginDto = z.infer<typeof LoginSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
