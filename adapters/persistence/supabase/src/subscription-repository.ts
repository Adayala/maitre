import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subscription, SubscriptionRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_subscriptions";

interface SubscriptionRow {
  id: string;
  tenant_id: string;
  subscriber_fiscal_entity_id: string | null;
  plan_code: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  cancellation_date: string | null;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ...(row.subscriber_fiscal_entity_id
      ? { subscriberFiscalEntityId: row.subscriber_fiscal_entity_id }
      : {}),
    planCode: row.plan_code,
    status: row.status as Subscription["status"],
    billingCycle: row.billing_cycle as Subscription["billingCycle"],
    startDate: new Date(row.start_date),
    renewalDate: new Date(row.renewal_date),
    cancellationDate: row.cancellation_date ? new Date(row.cancellation_date) : null,
    currentPeriodStart: new Date(row.current_period_start),
    currentPeriodEnd: new Date(row.current_period_end),
    autoRenew: row.auto_renew,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(subscription: Subscription): SubscriptionRow {
  return {
    id: subscription.id,
    tenant_id: subscription.tenantId,
    subscriber_fiscal_entity_id: subscription.subscriberFiscalEntityId ?? null,
    plan_code: subscription.planCode,
    status: subscription.status,
    billing_cycle: subscription.billingCycle,
    start_date: subscription.startDate.toISOString(),
    renewal_date: subscription.renewalDate.toISOString(),
    cancellation_date: subscription.cancellationDate
      ? subscription.cancellationDate.toISOString()
      : null,
    current_period_start: subscription.currentPeriodStart.toISOString(),
    current_period_end: subscription.currentPeriodEnd.toISOString(),
    auto_renew: subscription.autoRenew,
    created_at: subscription.createdAt.toISOString(),
    updated_at: subscription.updatedAt.toISOString(),
  };
}

export class SupabaseSubscriptionRepository implements SubscriptionRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SubscriptionRow) : null;
  }

  async findById(id: string): Promise<Subscription | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SubscriptionRow) : null;
  }

  async save(subscription: Subscription): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(subscription));
    if (error) throw error;
  }
}
