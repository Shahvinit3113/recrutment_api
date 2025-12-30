import { z } from "zod";
import { nonEmptyString } from "@/core/validation/schemas";

/**
 * ============================================================================
 * USER INFO VALIDATION SCHEMAS
 * ============================================================================
 */

export const CreateUserInfoSchema = z.object({
  FirstName: nonEmptyString.max(100),
  LastName: nonEmptyString.max(100),
  PhoneNumber: z.string().max(20).optional(),
  ProfilePicture: z.string().url().optional(),
});

export const UpdateUserInfoSchema = CreateUserInfoSchema.partial();

export type CreateUserInfoDto = z.infer<typeof CreateUserInfoSchema>;
export type UpdateUserInfoDto = z.infer<typeof UpdateUserInfoSchema>;
