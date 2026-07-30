import { z } from "zod";

// SPEC-044 — AuditLog Entity
export const auditActionSchema = z.enum(["CREATE", "UPDATE", "DELETE"]);
export const auditActorTypeSchema = z.enum(["USER", "SYSTEM"]);
export const auditOutcomeSchema = z.enum(["SUCCEEDED", "DENIED", "FAILED"]);

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorType: auditActorTypeSchema,
  actorId: z.string().uuid().optional(),
  action: auditActionSchema,
  actionCode: z.string().min(1).optional(),
  outcome: auditOutcomeSchema.optional(),
  branchId: z.string().uuid().optional(),
  reasonCode: z.string().min(1).optional(),
  requestId: z.string().min(1).optional(),
  resourceType: z.string().min(1),
  resourceId: z.string().uuid(),
  previousState: z.unknown().optional(),
  newState: z.unknown().optional(),
  correlationId: z.string().uuid().optional(),
  occurredAt: z.coerce.date(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;
