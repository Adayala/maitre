import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthorizationAttempt,
  AuthorizationAttemptRepositoryPort,
} from "@maitre/fiscal";

const TABLE = "fiscal_authorization_attempts";

function fromRow(row: Record<string, unknown>): AuthorizationAttempt {
  return {
    id: String(row["id"]),
    tenantId: String(row["tenant_id"]),
    invoiceId: String(row["invoice_id"]),
    fiscalEntityId: String(row["fiscal_entity_id"]),
    pointOfSaleId: String(row["point_of_sale_id"]),
    environment: row["environment"] as AuthorizationAttempt["environment"],
    voucherType: row["voucher_type"] as AuthorizationAttempt["voucherType"],
    requestedNumber: Number(row["requested_number"]),
    requestHash: String(row["request_hash"]),
    status: row["status"] as AuthorizationAttempt["status"],
    ...(row["provider_ref"] ? { providerRef: String(row["provider_ref"]) } : {}),
    ...(row["rejection_reason"]
      ? { rejectionReason: String(row["rejection_reason"]) }
      : {}),
    createdAt: new Date(String(row["created_at"])),
    ...(row["dispatched_at"]
      ? { dispatchedAt: new Date(String(row["dispatched_at"])) }
      : {}),
    ...(row["resolved_at"] ? { resolvedAt: new Date(String(row["resolved_at"])) } : {}),
    updatedAt: new Date(String(row["updated_at"])),
  };
}

export class SupabaseAuthorizationAttemptRepository
  implements AuthorizationAttemptRepositoryPort
{
  constructor(private readonly client: SupabaseClient) {}

  async findLatestByInvoice(
    tenantId: string,
    invoiceId: string,
  ): Promise<AuthorizationAttempt | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async save(attempt: AuthorizationAttempt): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert({
      id: attempt.id,
      tenant_id: attempt.tenantId,
      invoice_id: attempt.invoiceId,
      fiscal_entity_id: attempt.fiscalEntityId,
      point_of_sale_id: attempt.pointOfSaleId,
      environment: attempt.environment,
      voucher_type: attempt.voucherType,
      requested_number: attempt.requestedNumber,
      request_hash: attempt.requestHash,
      status: attempt.status,
      provider_ref: attempt.providerRef ?? null,
      rejection_reason: attempt.rejectionReason ?? null,
      created_at: attempt.createdAt.toISOString(),
      dispatched_at: attempt.dispatchedAt?.toISOString() ?? null,
      resolved_at: attempt.resolvedAt?.toISOString() ?? null,
      updated_at: attempt.updatedAt.toISOString(),
    });
    if (error) throw error;
  }
}
