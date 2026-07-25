import type { SupabaseClient } from "@supabase/supabase-js";
import type { Station, StationRepositoryPort } from "@maitre/kitchen";

const TABLE = "kitchen_stations";

interface StationRow {
  id: string;
  tenant_id: string;
  brand_id: string;
  branch_id: string;
  code: string;
  display_name: string;
  capabilities: unknown;
  status: string;
  display_order: number;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: StationRow): Station {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    branchId: row.branch_id,
    code: row.code,
    displayName: row.display_name,
    capabilities: (row.capabilities as string[]) ?? [],
    status: row.status as Station["status"],
    displayOrder: row.display_order,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(station: Station): StationRow {
  return {
    id: station.id,
    tenant_id: station.tenantId,
    brand_id: station.brandId,
    branch_id: station.branchId,
    code: station.code,
    display_name: station.displayName,
    capabilities: station.capabilities,
    status: station.status,
    display_order: station.displayOrder,
    revision: station.revision,
    created_at: station.createdAt.toISOString(),
    updated_at: station.updatedAt.toISOString(),
  };
}

export class SupabaseStationRepository implements StationRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Station | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as StationRow) : null;
  }

  async findByCode(tenantId: string, branchId: string, code: string): Promise<Station | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as StationRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Station[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("display_order", { ascending: true })
      .order("code", { ascending: true });
    if (error) throw error;
    return (data as StationRow[]).map(fromRow);
  }

  async firstActiveByBranch(tenantId: string, branchId: string): Promise<Station | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .eq("status", "ACTIVE")
      .order("display_order", { ascending: true })
      .order("code", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as StationRow) : null;
  }

  async save(station: Station): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(station));
    if (error) throw error;
  }
}
