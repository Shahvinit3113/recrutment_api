import { z } from "zod";
import { emailSchema, nonEmptyString, passwordSchema } from "@/core/validation/schemas";

/**
 * ============================================================================
 * USER VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Base user fields
 */
const BaseUserSchema = z.object({
  Email: emailSchema,
  Role: z.number().int().min(0).max(10),
  InfoId: nonEmptyString,
  IsVerified: z.boolean().default(false),
});

/**
 * Create user schema (with password)
 */
export const CreateUserSchema = BaseUserSchema.extend({
  Password: passwordSchema,
});

/**
 * Update user schema (all fields optional)
 */
export const UpdateUserSchema = BaseUserSchema.partial();

/**
 * Change password schema
 */
export const ChangePasswordSchema = z.object({
  CurrentPassword: z.string().min(1, "Current password is required"),
  NewPassword: passwordSchema,
  ConfirmPassword: z.string(),
}).refine((data) => data.NewPassword === data.ConfirmPassword, {
  message: "Passwords do not match",
  path: ["ConfirmPassword"],
});

/**
 * User query/filter schema
 */
export const UserFilterSchema = z.object({
  search: z.string().optional(),
  role: z.coerce.number().int().optional(),
  isVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Type exports
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UserFilterDto = z.infer<typeof UserFilterSchema>;
