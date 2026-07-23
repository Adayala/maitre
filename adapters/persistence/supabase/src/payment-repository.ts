import type { SupabaseClient } from "@supabase/supabase-js";
import type { Payment, PaymentRepositoryPort } from "@maitre/floor";

const TABLE = "floor_payments";

interface PaymentRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  check_id: string;
  amount_minor_units: number;
  currency: string;
  tip_minor_units: number | null;
  method: string;
  status: string;
  refund_amount_minor_units: number | null;
  refund_status: string | null;
  idempotency_key: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: PaymentRow): Payment {
  const hasRefund = row.refund_amount_minor_units !== null && row.refund_status !== null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    checkId: row.check_id,
    amountMinorUnits: row.amount_minor_units,
    currency: row.currency,
    method: row.method as Payment["method"],
    status: row.status as Payment["status"],
    idempotencyKey: row.idempotency_key,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.tip_minor_units !== null ? { tipMinorUnits: row.tip_minor_units } : {}),
    ...(hasRefund
      ? {
          refund: {
            amountMinorUnits: row.refund_amount_minor_units as number,
            status: row.refund_status as "PENDING" | "SUCCEEDED" | "FAILED",
          },
        }
      : {}),
  };
}

function toRow(payment: Payment): PaymentRow {
  return {
    id: payment.id,
    tenant_id: payment.tenantId,
    branch_id: payment.branchId,
    check_id: payment.checkId,
    amount_minor_units: payment.amountMinorUnits,
    currency: payment.currency,
    tip_minor_units: payment.tipMinorUnits ?? null,
    method: payment.method,
    status: payment.status,
    refund_amount_minor_units: payment.refund?.amountMinorUnits ?? null,
    refund_status: payment.refund?.status ?? null,
    idempotency_key: payment.idempotencyKey,
    revision: payment.revision,
    created_at: payment.createdAt.toISOString(),
    updated_at: payment.updatedAt.toISOString(),
  };
}

export class SupabasePaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Payment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PaymentRow) : null;
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<Payment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PaymentRow) : null;
  }

  async listByCheck(tenantId: string, checkId: string): Promise<Payment[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("check_id", checkId);
    if (error) throw error;
    return (data as PaymentRow[]).map(fromRow);
  }

  async save(payment: Payment): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(payment));
    if (error) throw error;
  }
}
