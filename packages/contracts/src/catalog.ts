import { z } from "zod";

// SPEC-037 — Menu Entity
export const menuStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const menuSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: menuStatusSchema,
  isDefault: z.boolean(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Menu = z.infer<typeof menuSchema>;

// SPEC-038 — Category Entity
export const categoryStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const categorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  brandId: z.string().uuid(),
  menuId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int(),
  status: categoryStatusSchema,
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Category = z.infer<typeof categorySchema>;

// SPEC-039 — Product Entity
export const productStatusSchema = z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]);
export const nutritionalInfoSchema = z.object({
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
});
export const productSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().optional(),
  priceMinorUnits: z.number().int().nonnegative(),
  currency: z.string().length(3),
  imageUrl: z.string().url().optional(),
  status: productStatusSchema,
  allergens: z.array(z.string()),
  nutritional: nutritionalInfoSchema.optional(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Product = z.infer<typeof productSchema>;
