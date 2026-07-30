import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InvoiceDelivery,
  InvoiceDeliveryRepositoryPort,
} from "@maitre/fiscal";

const TABLE = "fiscal_invoice_deliveries";

function fromRow(row: Record<string, unknown>): InvoiceDelivery {
  return {
    id: String(row["id"]),
    tenantId: String(row["tenant_id"]),
    invoiceId: String(row["invoice_id"]),
    channel: "EMAIL",
    recipientEmail: String(row["recipient_email"]),
    format: row["format"] as InvoiceDelivery["format"],
    idempotencyKey: String(row["idempotency_key"]),
    status: row["status"] as InvoiceDelivery["status"],
    attempts: Number(row["attempts"]),
    createdAt: new Date(String(row["created_at"])),
    updatedAt: new Date(String(row["updated_at"])),
    ...(row["sent_at"] ? { sentAt: new Date(String(row["sent_at"])) } : {}),
    ...(row["failure_reason"]
      ? { failureReason: String(row["failure_reason"]) }
      : {}),
  };
}

export class SupabaseInvoiceDeliveryRepository
  implements InvoiceDeliveryRepositoryPort
{
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string) {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string) {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async listByInvoice(tenantId: string, invoiceId: string) {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("invoice_id", invoiceId)
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  }

  async listProcessable(limit: number, staleBefore: Date) {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .or(
        `status.in.(QUEUED,FAILED),and(status.eq.PROCESSING,updated_at.lt.${staleBefore.toISOString()})`,
      )
      .order("created_at")
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  }

  async claimForProcessing(
    tenantId: string,
    id: string,
    updatedAt: Date,
    staleBefore: Date,
  ) {
    const { data, error } = await this.client
      .from(TABLE)
      .update({ status: "PROCESSING", updated_at: updatedAt.toISOString() })
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .or(
        `status.in.(QUEUED,FAILED),and(status.eq.PROCESSING,updated_at.lt.${staleBefore.toISOString()})`,
      )
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async save(delivery: InvoiceDelivery) {
    const { error } = await this.client.from(TABLE).upsert({
      id: delivery.id,
      tenant_id: delivery.tenantId,
      invoice_id: delivery.invoiceId,
      channel: delivery.channel,
      recipient_email: delivery.recipientEmail,
      format: delivery.format,
      idempotency_key: delivery.idempotencyKey,
      status: delivery.status,
      attempts: delivery.attempts,
      created_at: delivery.createdAt.toISOString(),
      updated_at: delivery.updatedAt.toISOString(),
      sent_at: delivery.sentAt?.toISOString() ?? null,
      failure_reason: delivery.failureReason ?? null,
    });
    if (error) throw error;
  }
}
