import type { SupabaseClient } from "@supabase/supabase-js";
import type { Check, CheckLine, CheckAdjustment, CheckRepositoryPort } from "@maitre/floor";

const TABLE = "floor_checks";

interface CheckRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  visit_id: string;
  currency: string;
  lines: CheckLine[];
  adjustments: CheckAdjustment[];
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CheckRow): Check {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    visitId: row.visit_id,
    currency: row.currency,
    lines: row.lines,
    adjustments: row.adjustments,
    status: row.status as Check["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(check: Check): CheckRow {
  return {
    id: check.id,
    tenant_id: check.tenantId,
    branch_id: check.branchId,
    visit_id: check.visitId,
    currency: check.currency,
    lines: check.lines,
    adjustments: check.adjustments,
    status: check.status,
    revision: check.revision,
    created_at: check.createdAt.toISOString(),
    updated_at: check.updatedAt.toISOString(),
  };
}

export class SupabaseCheckRepository implements CheckRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Check | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CheckRow) : null;
  }

  async findByVisit(tenantId: string, visitId: string): Promise<Check | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("visit_id", visitId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CheckRow) : null;
  }

  async save(check: Check): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(check));
    if (error) throw error;
  }
}
