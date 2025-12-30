import { z } from "zod";
import { nonEmptyString, PaginationQuerySchema } from "@/core/validation/schemas";

/**
 * ============================================================================
 * ORGANIZATION VALIDATION SCHEMAS
 * ============================================================================
 */

export const CreateOrganizationSchema = z.object({
  Name: nonEmptyString.max(200),
  Description: z.string().max(1000).optional(),
  Address: z.string().max(500).optional(),
  Phone: z.string().max(20).optional(),
  Email: z.string().email().optional(),
  Website: z.string().url().optional(),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export const OrganizationFilterSchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
});

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationFilterDto = z.infer<typeof OrganizationFilterSchema>;
