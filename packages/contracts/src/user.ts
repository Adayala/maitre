import { z } from "zod";

// SPEC-017 — User Entity
export const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  identityProvider: z.string().min(1),
  externalIdentityId: z.string().min(1),
  displayName: z.string().trim().min(1).max(100),
  email: z.string().email().nullable().optional(),
  status: userStatusSchema,
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().nullable().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().nullable().optional(),
  suspendedAt: z.coerce.date().nullable().optional(),
  deactivatedAt: z.coerce.date().nullable().optional(),
});
export type User = z.infer<typeof userSchema>;
