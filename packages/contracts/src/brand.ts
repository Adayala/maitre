import { z } from "zod";

// SPEC-002 — Brand Entity
export const brandStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export type BrandStatus = z.infer<typeof brandStatusSchema>;

export const brandConfigSchema = z.object({
  cancellationPolicy: z.string().optional(),
  brandVoice: z.string().optional(),
  allergenPolicy: z.string().optional(),
  language: z.string().length(2),
  currency: z.string().length(3),
});
export type BrandConfig = z.infer<typeof brandConfigSchema>;

export const brandSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().trim().min(3).max(100),
  slug: z.string().min(1),
  description: z.string().max(500).optional(),
  status: brandStatusSchema,
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  defaultMenuId: z.string().uuid().optional(),
  config: brandConfigSchema,
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
  archivedAt: z.coerce.date().nullable().optional(),
  archivedBy: z.string().uuid().nullable().optional(),
});
export type Brand = z.infer<typeof brandSchema>;
