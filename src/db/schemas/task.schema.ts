import { z } from "zod";
import { nonEmptyString } from "@/core/validation/schemas";

/**
 * ============================================================================
 * TASK VALIDATION SCHEMAS
 * ============================================================================
 */

export const CreateTaskSchema = z.object({
  Title: nonEmptyString.max(200),
  Description: z.string().optional(),
  DueDate: z.string().datetime().optional(),
  Priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  Status: z.enum(["Pending", "InProgress", "Completed", "Cancelled"]).default("Pending"),
  AssignedTo: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
