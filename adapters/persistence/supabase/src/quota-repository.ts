import type { SupabaseClient } from "@supabase/supabase-js";
import type { Quota, QuotaRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_quotas";

interface QuotaRow {
  id: string;
  subscription_id: string;
  resource: string;
  used: number;
  entitlement_id: string;
  last_updated_at: string;
}

function fromRow(row: QuotaRow): Quota {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    resource: row.resource,
    used: row.used,
    entitlementId: row.entitlement_id,
    lastUpdatedAt: new Date(row.last_updated_at),
  };
}

function toRow(quota: Quota): QuotaRow {
  return {
    id: quota.id,
    subscription_id: quota.subscriptionId,
    resource: quota.resource,
    used: quota.used,
    entitlement_id: quota.entitlementId,
    last_updated_at: quota.lastUpdatedAt.toISOString(),
  };
}

export class SupabaseQuotaRepository implements QuotaRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listBySubscription(subscriptionId: string): Promise<Quota[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId);
    if (error) throw error;
    return (data as QuotaRow[]).map(fromRow);
  }

  async findByResource(subscriptionId: string, resource: string): Promise<Quota | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId)
      .eq("resource", resource)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as QuotaRow) : null;
  }

  async save(quota: Quota): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(quota));
    if (error) throw error;
  }
}
