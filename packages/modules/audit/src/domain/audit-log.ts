// SPEC-044 — AuditLog domain model. Append-only: no update/delete method
// exists on the repository port by design (SPEC-044 §contract: "Eventos no
// se actualizan ni borran mediante API común").
//
// The API boundary records covered Floor, Ordering, Kitchen and Cash
// mutations. Domain-level atomic persistence with state and outbox changes,
// plus coverage of the remaining modules, stays explicit in the active
// OpenSpec change rather than being implied by this append-only model.

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
