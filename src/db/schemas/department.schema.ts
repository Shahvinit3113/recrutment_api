import { z } from "zod";
import { nonEmptyString, PaginationQuerySchema } from "@/core/validation/schemas";

/**
 * ============================================================================
 * DEPARTMENT VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Create department schema
 */
export const CreateDepartmentSchema = z.object({
  Name: nonEmptyString.max(200),
  Description: z.string().max(500).optional(),
  OrganizationId: nonEmptyString,
});

/**
 * Update department schema
 */
export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();

/**
 * Department filter schema
 */
export const DepartmentFilterSchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  organizationId: z.string().optional(),
});

// Type exports
export type CreateDepartmentDto = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof UpdateDepartmentSchema>;
export type DepartmentFilterDto = z.infer<typeof DepartmentFilterSchema>;
