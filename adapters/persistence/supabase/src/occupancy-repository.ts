import type { SupabaseClient } from "@supabase/supabase-js";
import type { Occupancy, OccupancyRepositoryPort } from "@maitre/floor";

const TABLE = "floor_occupancies";

interface OccupancyRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  table_id: string;
  visit_id: string;
  guest_count: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  revision: number;
}

function fromRow(row: OccupancyRow): Occupancy {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    tableId: row.table_id,
    visitId: row.visit_id,
    guestCount: row.guest_count,
    status: row.status as Occupancy["status"],
    startedAt: new Date(row.started_at),
    revision: row.revision,
    ...(row.ended_at !== null ? { endedAt: new Date(row.ended_at) } : {}),
  };
}

function toRow(occupancy: Occupancy): OccupancyRow {
  return {
    id: occupancy.id,
    tenant_id: occupancy.tenantId,
    branch_id: occupancy.branchId,
    table_id: occupancy.tableId,
    visit_id: occupancy.visitId,
    guest_count: occupancy.guestCount,
    status: occupancy.status,
    started_at: occupancy.startedAt.toISOString(),
    ended_at: occupancy.endedAt ? occupancy.endedAt.toISOString() : null,
    revision: occupancy.revision,
  };
}

export class SupabaseOccupancyRepository implements OccupancyRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Occupancy | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as OccupancyRow) : null;
  }

  async listByVisit(tenantId: string, visitId: string): Promise<Occupancy[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("visit_id", visitId);
    if (error) throw error;
    return (data as OccupancyRow[]).map(fromRow);
  }

  async listByTable(tenantId: string, tableId: string): Promise<Occupancy[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("table_id", tableId);
    if (error) throw error;
    return (data as OccupancyRow[]).map(fromRow);
  }

  async findActiveByTable(tenantId: string, tableId: string): Promise<Occupancy | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("table_id", tableId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as OccupancyRow) : null;
  }

  async save(occupancy: Occupancy): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(occupancy));
    if (error) throw error;
  }
}
