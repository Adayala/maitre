import { z } from "zod";

// SPEC-005 — Salon Entity
export const salonStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export type SalonStatus = z.infer<typeof salonStatusSchema>;

export const salonSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  capacity: z.number().int().positive(),
  description: z.string().optional(),
  status: salonStatusSchema,
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type Salon = z.infer<typeof salonSchema>;
