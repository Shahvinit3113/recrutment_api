import { z } from "zod";
import { nonEmptyString, PaginationQuerySchema } from "@/core/validation/schemas";

/**
 * ============================================================================
 * POSITION VALIDATION SCHEMAS
 * ============================================================================
 */

export const CreatePositionSchema = z.object({
  Title: nonEmptyString.max(200),
  Description: z.string().optional(),
  DepartmentId: nonEmptyString,
  Requirements: z.string().optional(),
  SalaryRange: z.string().max(100).optional(),
  Status: z.enum(["Open", "Closed", "Draft"]).default("Draft"),
});

export const UpdatePositionSchema = CreatePositionSchema.partial();

export const PositionFilterSchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(["Open", "Closed", "Draft"]).optional(),
});

export type CreatePositionDto = z.infer<typeof CreatePositionSchema>;
export type UpdatePositionDto = z.infer<typeof UpdatePositionSchema>;
export type PositionFilterDto = z.infer<typeof PositionFilterSchema>;
