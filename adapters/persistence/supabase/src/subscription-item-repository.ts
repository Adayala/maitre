import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionItem, SubscriptionItemRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_items";

interface SubscriptionItemRow {
  id: string;
  subscription_id: string;
  service_id: string;
  scope_ref_id: string | null;
  status: string;
  quantity: number;
  unit_price: number;
  activated_at: string;
  deactivated_at: string | null;
}

function fromRow(row: SubscriptionItemRow): SubscriptionItem {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    serviceId: row.service_id,
    scopeRefId: row.scope_ref_id,
    status: row.status as SubscriptionItem["status"],
    quantity: row.quantity,
    unitPrice: row.unit_price,
    activatedAt: new Date(row.activated_at),
    deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at) : null,
  };
}

function toRow(item: SubscriptionItem): SubscriptionItemRow {
  return {
    id: item.id,
    subscription_id: item.subscriptionId,
    service_id: item.serviceId,
    scope_ref_id: item.scopeRefId ?? null,
    status: item.status,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    activated_at: item.activatedAt.toISOString(),
    deactivated_at: item.deactivatedAt ? item.deactivatedAt.toISOString() : null,
  };
}

export class SupabaseSubscriptionItemRepository implements SubscriptionItemRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listBySubscription(subscriptionId: string): Promise<SubscriptionItem[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId);
    if (error) throw error;
    return (data as SubscriptionItemRow[]).map(fromRow);
  }

  async findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId: string | null = null,
  ): Promise<SubscriptionItem | null> {
    let query = this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId)
      .eq("service_id", serviceId);
    query = scopeRefId ? query.eq("scope_ref_id", scopeRefId) : query.is("scope_ref_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SubscriptionItemRow) : null;
  }

  async save(item: SubscriptionItem): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(item));
    if (error) throw error;
  }
}
