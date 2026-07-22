import { z } from "zod";

// SPEC-004 — Branch Entity
export const branchStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export type BranchStatus = z.infer<typeof branchStatusSchema>;

export const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  subdivision: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().length(2),
});
export type Address = z.infer<typeof addressSchema>;

const branchCodePattern = /^[A-Z0-9][A-Z0-9_-]{0,31}$/;

export const branchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  brandId: z.string().uuid(),
  fiscalEntityId: z.string().uuid().optional(),
  code: z.string().regex(branchCodePattern),
  name: z.string().trim().min(1).max(120),
  timezone: z.string().min(1),
  status: branchStatusSchema,
  address: addressSchema.optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Branch = z.infer<typeof branchSchema>;
