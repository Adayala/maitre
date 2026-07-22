import { z } from "zod";

// SPEC-001 — Tenant Entity
export const tenantStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  status: tenantStatusSchema,
  defaultLocale: z.string().min(2),
  defaultCurrency: z.string().length(3),
  defaultTimezone: z.string().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Tenant = z.infer<typeof tenantSchema>;
