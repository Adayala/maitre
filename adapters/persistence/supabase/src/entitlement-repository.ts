import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entitlement, EntitlementRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_entitlements";

interface EntitlementRow {
  id: string;
  subscription_id: string;
  resource: string;
  soft_limit: number | null;
  hard_limit: number;
  override_reason: string | null;
  expires_at: string | null;
}

function fromRow(row: EntitlementRow): Entitlement {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    resource: row.resource as Entitlement["resource"],
    hardLimit: row.hard_limit,
    softLimit: row.soft_limit,
    overrideReason: row.override_reason,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
  };
}

function toRow(entitlement: Entitlement): EntitlementRow {
  return {
    id: entitlement.id,
    subscription_id: entitlement.subscriptionId,
    resource: entitlement.resource,
    soft_limit: entitlement.softLimit ?? null,
    hard_limit: entitlement.hardLimit,
    override_reason: entitlement.overrideReason ?? null,
    expires_at: entitlement.expiresAt ? entitlement.expiresAt.toISOString() : null,
  };
}

export class SupabaseEntitlementRepository implements EntitlementRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listBySubscription(subscriptionId: string): Promise<Entitlement[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId);
    if (error) throw error;
    return (data as EntitlementRow[]).map(fromRow);
  }

  async save(entitlement: Entitlement): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(entitlement));
    if (error) throw error;
  }

  async deleteByResource(subscriptionId: string, resource: string): Promise<void> {
    const { error } = await this.client
      .from(TABLE)
      .delete()
      .eq("subscription_id", subscriptionId)
      .eq("resource", resource);
    if (error) throw error;
  }
}
