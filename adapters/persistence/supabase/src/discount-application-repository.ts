import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscountApplication, DiscountApplicationRepositoryPort } from "@maitre/cash";

const TABLE = "cash_discount_applications";

interface DiscountApplicationRow {
  id: string;
  tenant_id: string;
  discount_id: string;
  discount_version: number;
  discount_type: string;
  order_id: string | null;
  check_id: string | null;
  eligible_base_minor_units: number;
  applied_amount_minor_units: number;
  currency: string;
  actor_ref: string;
  reason_code: string | null;
  created_at: string;
}

function fromRow(row: DiscountApplicationRow): DiscountApplication {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    discountId: row.discount_id,
    discountVersion: row.discount_version,
    discountType: row.discount_type as DiscountApplication["discountType"],
    orderId: row.order_id,
    checkId: row.check_id,
    eligibleBaseMinorUnits: row.eligible_base_minor_units,
    appliedAmountMinorUnits: row.applied_amount_minor_units,
    currency: row.currency,
    actorRef: row.actor_ref,
    reasonCode: row.reason_code,
    createdAt: new Date(row.created_at),
  };
}

function toRow(application: DiscountApplication): DiscountApplicationRow {
  return {
    id: application.id,
    tenant_id: application.tenantId,
    discount_id: application.discountId,
    discount_version: application.discountVersion,
    discount_type: application.discountType,
    order_id: application.orderId ?? null,
    check_id: application.checkId ?? null,
    eligible_base_minor_units: application.eligibleBaseMinorUnits,
    applied_amount_minor_units: application.appliedAmountMinorUnits,
    currency: application.currency,
    actor_ref: application.actorRef,
    reason_code: application.reasonCode ?? null,
    created_at: application.createdAt.toISOString(),
  };
}

export class SupabaseDiscountApplicationRepository implements DiscountApplicationRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<DiscountApplication | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as DiscountApplicationRow) : null;
  }

  async listByTarget(
    tenantId: string,
    targetType: "ORDER" | "CHECK",
    targetId: string,
  ): Promise<DiscountApplication[]> {
    const column = targetType === "ORDER" ? "order_id" : "check_id";
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq(column, targetId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as DiscountApplicationRow[]).map(fromRow);
  }

  async save(application: DiscountApplication): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(application));
    if (error) throw error;
  }
}
