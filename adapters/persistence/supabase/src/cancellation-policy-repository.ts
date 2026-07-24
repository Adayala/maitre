import type { SupabaseClient } from "@supabase/supabase-js";
import type { CancellationPolicy, CancellationPolicyRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_cancellation_policies";

interface CancellationPolicyRow {
  id: string;
  tenant_id: string;
  name: string;
  hours_before_start_cutoff: number;
  fee_description: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CancellationPolicyRow): CancellationPolicy {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    hoursBeforeStartCutoff: row.hours_before_start_cutoff,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.fee_description !== null ? { feeDescription: row.fee_description } : {}),
  };
}

function toRow(policy: CancellationPolicy): CancellationPolicyRow {
  return {
    id: policy.id,
    tenant_id: policy.tenantId,
    name: policy.name,
    hours_before_start_cutoff: policy.hoursBeforeStartCutoff,
    fee_description: policy.feeDescription ?? null,
    revision: policy.revision,
    created_at: policy.createdAt.toISOString(),
    updated_at: policy.updatedAt.toISOString(),
  };
}

export class SupabaseCancellationPolicyRepository implements CancellationPolicyRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CancellationPolicy | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CancellationPolicyRow) : null;
  }

  async findByTenant(tenantId: string): Promise<CancellationPolicy | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CancellationPolicyRow) : null;
  }

  async save(policy: CancellationPolicy): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(policy));
    if (error) throw error;
  }
}
