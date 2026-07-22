import { z } from "zod";

// SPEC-003 — FiscalEntity Entity
export const fiscalEntityStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export type FiscalEntityStatus = z.infer<typeof fiscalEntityStatusSchema>;

export const taxConditionSchema = z.enum(["RI", "MONOTRIBUTISTA", "EXENTO"]);
export type TaxCondition = z.infer<typeof taxConditionSchema>;

export const fiscalCertificateSchema = z.object({
  serial: z.string().min(1),
  subject: z.string().min(1),
  issuer: z.string().min(1),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  thumbprint: z.string().min(1),
});
export type FiscalCertificate = z.infer<typeof fiscalCertificateSchema>;

const cuitPattern = /^\d{11}$/;

export const fiscalEntitySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  cuit: z.string().regex(cuitPattern),
  name: z.string().trim().min(3).max(200),
  status: fiscalEntityStatusSchema,
  taxCondition: taxConditionSchema,
  certificate: fiscalCertificateSchema.optional(),
  encryptedCertificateKeyRef: z.string().optional(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().optional(),
});
export type FiscalEntity = z.infer<typeof fiscalEntitySchema>;
