import { z } from "zod";

/**
 * ============================================================================
 * COMMON VALIDATION SCHEMAS
 * ============================================================================
 *
 * Reusable Zod schemas for common validation patterns.
 * Import these and compose them into your entity-specific schemas.
 */

/**
 * ============================================================================
 * PRIMITIVE SCHEMAS
 * ============================================================================
 */

/** UUID string validation */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/** Non-empty string */
export const nonEmptyString = z.string().min(1, "Field cannot be empty");

/** Email validation */
export const emailSchema = z.string().email("Invalid email format");

/** Password validation (min 8 chars, at least one number and special char) */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

/** Phone number validation */
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
  .optional();

/** URL validation */
export const urlSchema = z.string().url("Invalid URL format");

/** Date string in ISO format */
export const dateStringSchema = z.string().datetime("Invalid date format");

/** Positive integer */
export const positiveInt = z.number().int().positive();

/** Non-negative integer */
export const nonNegativeInt = z.number().int().min(0);

/**
 * ============================================================================
 * COMMON PARAM SCHEMAS
 * ============================================================================
 */

/** Standard ID parameter */
export const IdParamsSchema = z.object({
  id: nonEmptyString,
});

/** UUID ID parameter */
export const UuidIdParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * ============================================================================
 * PAGINATION SCHEMAS
 * ============================================================================
 */

/** Standard pagination query (coerces string to number) */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/** Search query with pagination */
export const SearchQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
});

/** Type inference helpers */
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type IdParams = z.infer<typeof IdParamsSchema>;

/**
 * ============================================================================
 * ENTITY BASE SCHEMAS
 * ============================================================================
 */

/** Base entity fields (for responses) */
export const BaseEntitySchema = z.object({
  Id: z.string(),
  IsDeleted: z.boolean(),
  CreatedBy: z.string(),
  CreatedOn: z.date(),
  ModifiedBy: z.string().nullable(),
  ModifiedOn: z.date().nullable(),
});

/** Base create DTO (excludes auto-generated fields) */
export const BaseCreateSchema = z.object({
  // No fields required - entity-specific schemas extend this
});

/** Base update DTO (all fields optional) */
export const BaseUpdateSchema = z.object({
  // No fields required - entity-specific schemas extend this
});

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Create a schema that makes all properties optional (for PATCH operations)
 */
export function partialSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Create a schema that requires at least one field to be present
 */
export function atLeastOne<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema
    .partial()
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
      message: "At least one field must be provided",
    });
}

/**
 * Create a schema for array of IDs (for bulk operations)
 */
export const IdsArraySchema = z.object({
  ids: z.array(nonEmptyString).min(1, "At least one ID is required"),
});

/**
 * ============================================================================
 * EXAMPLE ENTITY SCHEMAS
 * ============================================================================
 *
 * Below are examples of how to create entity-specific schemas.
 * Create similar files in your entities or a dedicated schemas folder.
 */

// Example: User schemas
export const CreateUserSchema = z.object({
  Email: emailSchema,
  Password: passwordSchema,
  FirstName: nonEmptyString.max(100),
  LastName: nonEmptyString.max(100),
  Role: z.number().int().min(0).max(10).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({
  Password: true,
});

export const LoginSchema = z.object({
  Email: emailSchema,
  Password: z.string().min(1, "Password is required"),
});

// Type inference
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
