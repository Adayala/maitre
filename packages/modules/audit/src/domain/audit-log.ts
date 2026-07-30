// SPEC-044 — AuditLog domain model. Append-only: no update/delete method
// exists on the repository port by design (SPEC-044 §contract: "Eventos no
// se actualizan ni borran mediante API común").
//
// The API boundary requires explicit business policies for every covered
// Floor, Ordering, Kitchen and Cash mutation. Evidence passes through the
// audit module's central redaction and size boundary before append.

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditActorType = "USER" | "SYSTEM";
export type AuditOutcome = "SUCCEEDED" | "DENIED" | "FAILED";

export interface AuditLog {
  id: string;
  tenantId: string;
  actorType: AuditActorType;
  actorId?: string;
  action: AuditAction;
  actionCode?: string;
  outcome?: AuditOutcome;
  branchId?: string;
  reasonCode?: string;
  requestId?: string;
  resourceType: string;
  resourceId: string;
  previousState?: unknown;
  newState?: unknown;
  correlationId?: string;
  occurredAt: Date;
}
