import type { SupabaseClient } from "@supabase/supabase-js";
import type { Salon, SalonRepositoryPort } from "@maitre/organization";

const TABLE = "organization_salons";

interface SalonRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  name: string;
  capacity: number;
  description: string | null;
  status: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: SalonRow): Salon {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    name: row.name,
    capacity: row.capacity,
    status: row.status as Salon["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
  };
}

function toRow(salon: Salon): SalonRow {
  return {
    id: salon.id,
    tenant_id: salon.tenantId,
    branch_id: salon.branchId,
    name: salon.name,
    capacity: salon.capacity,
    description: salon.description ?? null,
    status: salon.status,
    created_at: salon.createdAt.toISOString(),
    created_by: salon.createdBy ?? null,
    updated_at: salon.updatedAt.toISOString(),
    updated_by: salon.updatedBy ?? null,
  };
}

export class SupabaseSalonRepository implements SalonRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Salon | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SalonRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Salon[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as SalonRow[]).map(fromRow);
  }

  async save(salon: Salon): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(salon));
    if (error) throw error;
  }
}
