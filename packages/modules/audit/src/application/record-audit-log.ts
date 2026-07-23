import { randomUUID } from "node:crypto";
import type { AuditAction, AuditActorType, AuditLog } from "../domain/audit-log.js";
import type { AuditLogRepositoryPort } from "./ports.js";

export interface RecordAuditLogInput {
  tenantId: string;
  actorType: AuditActorType;
  actorId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  previousState?: unknown;
  newState?: unknown;
  correlationId?: string;
}

export interface RecordAuditLogDeps {
  auditLogs: AuditLogRepositoryPort;
  now?: () => Date;
}

// SPEC-044 — appends one immutable entry. Callers (other modules' use
// cases) decide what to redact before previousState/newState reach here;
// this function does not sanitize — see the deferred-instrumentation note
// in domain/audit-log.ts.
export async function recordAuditLog(
  deps: RecordAuditLogDeps,
  input: RecordAuditLogInput,
): Promise<AuditLog> {
  const now = (deps.now ?? (() => new Date()))();
  const entry: AuditLog = {
    id: randomUUID(),
    tenantId: input.tenantId,
    actorType: input.actorType,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    occurredAt: now,
    ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
    ...(input.previousState !== undefined ? { previousState: input.previousState } : {}),
    ...(input.newState !== undefined ? { newState: input.newState } : {}),
    ...(input.correlationId !== undefined ? { correlationId: input.correlationId } : {}),
  };
  await deps.auditLogs.append(entry);
  return entry;
}
