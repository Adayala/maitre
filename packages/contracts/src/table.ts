import { z } from "zod";

// SPEC-006 — Table Entity
export const tableShapeSchema = z.enum(["ROUND", "RECTANGULAR", "SQUARE", "IRREGULAR"]);
export type TableShape = z.infer<typeof tableShapeSchema>;

export const tableStatusSchema = z.enum([
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "PAYING",
  "CLEANING",
  "BLOCKED",
]);
export type TableStatus = z.infer<typeof tableStatusSchema>;

export const tableLocationSchema = z.object({
  floor: z.number().int(),
  zone: z.string().optional(),
});
export type TableLocation = z.infer<typeof tableLocationSchema>;

export const tableFeaturesSchema = z.object({
  isWheelchairAccessible: z.boolean(),
  hasPowerOutlet: z.boolean(),
  isOutdoors: z.boolean(),
});
export type TableFeatures = z.infer<typeof tableFeaturesSchema>;

export const tableSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  salonId: z.string().uuid(),
  number: z.string().min(1).max(10),
  name: z.string().max(50).optional(),
  capacity: z.number().int().min(1).max(20),
  location: tableLocationSchema.optional(),
  features: tableFeaturesSchema.optional(),
  shape: tableShapeSchema.optional(),
  minDurationMinutes: z.number().int().min(30).optional(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Table = z.infer<typeof tableSchema>;
