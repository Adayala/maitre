import type { SupabaseClient } from "@supabase/supabase-js";
import type { Discount, DiscountRepositoryPort } from "@maitre/cash";

const TABLE = "cash_discounts";

interface DiscountRow {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  value: number;
  scope: string;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: DiscountRow): Discount {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    type: row.type as Discount["type"],
    value: row.value,
    scope: row.scope,
    validFrom: row.valid_from ? new Date(row.valid_from) : null,
    validUntil: row.valid_until ? new Date(row.valid_until) : null,
    status: row.status as Discount["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(discount: Discount): DiscountRow {
  return {
    id: discount.id,
    tenant_id: discount.tenantId,
    name: discount.name,
    type: discount.type,
    value: discount.value,
    scope: discount.scope,
    valid_from: discount.validFrom ? discount.validFrom.toISOString() : null,
    valid_until: discount.validUntil ? discount.validUntil.toISOString() : null,
    status: discount.status,
    revision: discount.revision,
    created_at: discount.createdAt.toISOString(),
    updated_at: discount.updatedAt.toISOString(),
  };
}

export class SupabaseDiscountRepository implements DiscountRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Discount | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as DiscountRow) : null;
  }

  async listByTenant(tenantId: string): Promise<Discount[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DiscountRow[]).map(fromRow);
  }

  async save(discount: Discount): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(discount));
    if (error) throw error;
  }
}
