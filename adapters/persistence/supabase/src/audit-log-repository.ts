import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLog, AuditLogQuery, AuditLogPage, AuditLogRepositoryPort } from "@maitre/audit";

const TABLE = "audit_logs";

interface AuditLogRow {
  id: string;
  tenant_id: string;
  actor_type: string;
  actor_id: string | null;
  action: string;
  action_code: string | null;
  outcome: string | null;
  branch_id: string | null;
  reason_code: string | null;
  request_id: string | null;
  resource_type: string;
  resource_id: string;
  previous_state: unknown;
  new_state: unknown;
  correlation_id: string | null;
  occurred_at: string;
}

function fromRow(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    actorType: row.actor_type as AuditLog["actorType"],
    action: row.action as AuditLog["action"],
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    occurredAt: new Date(row.occurred_at),
    ...(row.action_code !== null ? { actionCode: row.action_code } : {}),
    ...(row.outcome !== null
      ? { outcome: row.outcome as NonNullable<AuditLog["outcome"]> }
      : {}),
    ...(row.branch_id !== null ? { branchId: row.branch_id } : {}),
    ...(row.reason_code !== null ? { reasonCode: row.reason_code } : {}),
    ...(row.request_id !== null ? { requestId: row.request_id } : {}),
    ...(row.actor_id !== null ? { actorId: row.actor_id } : {}),
    ...(row.previous_state !== null ? { previousState: row.previous_state } : {}),
    ...(row.new_state !== null ? { newState: row.new_state } : {}),
    ...(row.correlation_id !== null ? { correlationId: row.correlation_id } : {}),
  };
}

function toRow(entry: AuditLog): AuditLogRow {
  return {
    id: entry.id,
    tenant_id: entry.tenantId,
    actor_type: entry.actorType,
    actor_id: entry.actorId ?? null,
    action: entry.action,
    action_code: entry.actionCode ?? null,
    outcome: entry.outcome ?? null,
    branch_id: entry.branchId ?? null,
    reason_code: entry.reasonCode ?? null,
    request_id: entry.requestId ?? null,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    previous_state: entry.previousState ?? null,
    new_state: entry.newState ?? null,
    correlation_id: entry.correlationId ?? null,
    occurred_at: entry.occurredAt.toISOString(),
  };
}

interface Cursor {
  occurredAt: string;
  id: string;
}

function encodeCursor(entry: AuditLog): string {
  return Buffer.from(
    JSON.stringify({ occurredAt: entry.occurredAt.toISOString(), id: entry.id }),
  ).toString("base64url");
}

function decodeCursor(cursor: string): Cursor {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
}

export class SupabaseAuditLogRepository implements AuditLogRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async append(entry: AuditLog): Promise<void> {
    const { error } = await this.client.from(TABLE).insert(toRow(entry));
    if (error) throw error;
  }

  async query(params: AuditLogQuery): Promise<AuditLogPage> {
    const limit = params.limit ?? 100;
    let query = this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", params.tenantId)
      .order("occurred_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    if (params.actorId) query = query.eq("actor_id", params.actorId);
    if (params.branchId) query = query.eq("branch_id", params.branchId);
    if (params.actionCode) query = query.eq("action_code", params.actionCode);
    if (params.outcome) query = query.eq("outcome", params.outcome);
    if (params.resourceType) query = query.eq("resource_type", params.resourceType);
    if (params.resourceId) query = query.eq("resource_id", params.resourceId);
    if (params.correlationId) query = query.eq("correlation_id", params.correlationId);
    if (params.from) query = query.gte("occurred_at", params.from.toISOString());
    if (params.to) query = query.lte("occurred_at", params.to.toISOString());
    if (params.cursor) {
      const { occurredAt, id } = decodeCursor(params.cursor);
      // Keyset pagination: strictly before the cursor's (occurredAt, id).
      query = query.or(
        `occurred_at.lt.${occurredAt},and(occurred_at.eq.${occurredAt},id.lt.${id})`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data as AuditLogRow[];
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit).map(fromRow);
    const nextCursor = hasMore && page.length > 0 ? encodeCursor(page[page.length - 1]!) : undefined;

    return { items: page, ...(nextCursor ? { nextCursor } : {}) };
  }
}
