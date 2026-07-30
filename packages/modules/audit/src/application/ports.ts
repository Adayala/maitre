import type { AuditLog } from "../domain/audit-log.js";

export interface AuditLogQuery {
  tenantId: string;
  actorId?: string;
  branchId?: string;
  actionCode?: string;
  outcome?: AuditLog["outcome"];
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  /** Opaque cursor from a previous page's last item (occurredAt+id encoded). */
  cursor?: string;
}

export interface AuditLogPage {
  items: AuditLog[];
  nextCursor?: string;
}

export interface AuditLogRepositoryPort {
  append(entry: AuditLog): Promise<void>;
  /** SPEC-045 §contract — descending stable order by (occurredAt, id). */
  query(params: AuditLogQuery): Promise<AuditLogPage>;
}
