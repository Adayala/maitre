import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Invoice,
  InvoiceLineItem,
  InvoiceTotals,
  RecipientSnapshot,
  FiscalEnvironment,
  VoucherType,
  InvoiceRepositoryPort,
} from "@maitre/fiscal";

const TABLE = "fiscal_invoices";

// Line items and totals are stored as JSONB inside the invoice row (Floor Check
// precedent — the aggregate owns its lines rather than a separate table).
interface InvoiceRow {
  id: string;
  tenant_id: string;
  fiscal_entity_id: string;
  environment: string;
  point_of_sale_id: string;
  voucher_type: string;
  number: number | null;
  status: string;
  currency: string;
  recipient: RecipientSnapshot | null;
  line_items: InvoiceLineItem[];
  totals: InvoiceTotals;
  source_check_id: string | null;
  source_check_revision: number | null;
  linked_invoice_id: string | null;
  authorization_provider_ref: string | null;
  cae: string | null;
  cae_expires_at: string | null;
  rejection_reason: string | null;
  normative_version: string;
  revision: number;
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  authorized_at: string | null;
}

function fromRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    fiscalEntityId: row.fiscal_entity_id,
    environment: row.environment as FiscalEnvironment,
    pointOfSaleId: row.point_of_sale_id,
    voucherType: row.voucher_type as VoucherType,
    number: row.number,
    status: row.status as Invoice["status"],
    currency: row.currency,
    recipient: row.recipient,
    lineItems: row.line_items ?? [],
    totals: row.totals,
    sourceCheckId: row.source_check_id,
    sourceCheckRevision: row.source_check_revision,
    linkedInvoiceId: row.linked_invoice_id,
    authorizationProviderRef: row.authorization_provider_ref,
    cae: row.cae,
    caeExpiresAt: row.cae_expires_at ? new Date(row.cae_expires_at) : null,
    rejectionReason: row.rejection_reason,
    normativeVersion: row.normative_version,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    validatedAt: row.validated_at ? new Date(row.validated_at) : null,
    authorizedAt: row.authorized_at ? new Date(row.authorized_at) : null,
  };
}

function toRow(invoice: Invoice): InvoiceRow {
  return {
    id: invoice.id,
    tenant_id: invoice.tenantId,
    fiscal_entity_id: invoice.fiscalEntityId,
    environment: invoice.environment,
    point_of_sale_id: invoice.pointOfSaleId,
    voucher_type: invoice.voucherType,
    number: invoice.number ?? null,
    status: invoice.status,
    currency: invoice.currency,
    recipient: invoice.recipient ?? null,
    line_items: invoice.lineItems,
    totals: invoice.totals,
    source_check_id: invoice.sourceCheckId ?? null,
    source_check_revision: invoice.sourceCheckRevision ?? null,
    linked_invoice_id: invoice.linkedInvoiceId ?? null,
    authorization_provider_ref: invoice.authorizationProviderRef ?? null,
    cae: invoice.cae ?? null,
    cae_expires_at: invoice.caeExpiresAt ? invoice.caeExpiresAt.toISOString() : null,
    rejection_reason: invoice.rejectionReason ?? null,
    normative_version: invoice.normativeVersion,
    revision: invoice.revision,
    created_at: invoice.createdAt.toISOString(),
    updated_at: invoice.updatedAt.toISOString(),
    validated_at: invoice.validatedAt ? invoice.validatedAt.toISOString() : null,
    authorized_at: invoice.authorizedAt ? invoice.authorizedAt.toISOString() : null,
  };
}

export class SupabaseInvoiceRepository implements InvoiceRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Invoice | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as InvoiceRow) : null;
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("fiscal_entity_id", fiscalEntityId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as InvoiceRow[]).map(fromRow);
  }

  async listByTenant(tenantId: string): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as InvoiceRow[]).map(fromRow);
  }

  async findMaxNumber(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    pointOfSaleId: string,
    voucherType: VoucherType,
  ): Promise<number | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("number")
      .eq("tenant_id", tenantId)
      .eq("fiscal_entity_id", fiscalEntityId)
      .eq("environment", environment)
      .eq("point_of_sale_id", pointOfSaleId)
      .eq("voucher_type", voucherType)
      .not("number", "is", null)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    const row = data as { number: number | null } | null;
    return row?.number ?? null;
  }

  async save(invoice: Invoice): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(invoice));
    if (error) throw error;
  }
}
