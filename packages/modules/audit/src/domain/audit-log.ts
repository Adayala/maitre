// SPEC-044 — AuditLog domain model. Append-only: no update/delete method
// exists on the repository port by design (SPEC-044 §contract: "Eventos no
// se actualizan ni borran mediante API común").
//
// NOT included: automatic instrumentation of every mutation across
// Organization/Identity/Subscription/Catalog. This entity + its repository
// and read API are ready to receive entries; wiring append() calls into
// every other module's use cases is a deliberately deferred, separate pass
// (would touch ~20 existing use cases) — noted here rather than silently
// left undone.

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditActorType = "USER" | "SYSTEM";

export interface AuditLog {
  id: string;
  tenantId: string;
  actorType: AuditActorType;
  actorId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  previousState?: unknown;
  newState?: unknown;
  correlationId?: string;
  occurredAt: Date;
}
