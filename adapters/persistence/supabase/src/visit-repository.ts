import type { SupabaseClient } from "@supabase/supabase-js";
import type { Visit, VisitRepositoryPort } from "@maitre/floor";

const TABLE = "floor_visits";

interface VisitRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  table_ids: string[];
  guest_count: number;
  reservation_id: string | null;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

function fromRow(row: VisitRow): Visit {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    tableIds: row.table_ids,
    guestCount: row.guest_count,
    status: row.status as Visit["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.reservation_id !== null ? { reservationId: row.reservation_id } : {}),
    ...(row.closed_at !== null ? { closedAt: new Date(row.closed_at) } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: new Date(row.cancelled_at) } : {}),
    ...(row.cancel_reason !== null ? { cancelReason: row.cancel_reason } : {}),
  };
}

function toRow(visit: Visit): VisitRow {
  return {
    id: visit.id,
    tenant_id: visit.tenantId,
    branch_id: visit.branchId,
    table_ids: visit.tableIds,
    guest_count: visit.guestCount,
    reservation_id: visit.reservationId ?? null,
    status: visit.status,
    revision: visit.revision,
    created_at: visit.createdAt.toISOString(),
    updated_at: visit.updatedAt.toISOString(),
    closed_at: visit.closedAt ? visit.closedAt.toISOString() : null,
    cancelled_at: visit.cancelledAt ? visit.cancelledAt.toISOString() : null,
    cancel_reason: visit.cancelReason ?? null,
  };
}

export class SupabaseVisitRepository implements VisitRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Visit | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as VisitRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Visit[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as VisitRow[]).map(fromRow);
  }

  async save(visit: Visit): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(visit));
    if (error) throw error;
  }
}
