import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceTemplate, InvoiceTemplateRepositoryPort } from "@maitre/fiscal";

const TABLE = "fiscal_invoice_templates";

interface TemplateRow {
  id: string;
  tenant_id: string;
  brand_id: string | null;
  name: string;
  channel: string;
  status: string;
  content_ref: string;
  variable_schema_version: number;
  layout_normative_version: string;
  published_at: string | null;
  published_by: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: TemplateRow): InvoiceTemplate {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    name: row.name,
    channel: row.channel,
    status: row.status as InvoiceTemplate["status"],
    contentRef: row.content_ref,
    variableSchemaVersion: row.variable_schema_version,
    layoutNormativeVersion: row.layout_normative_version,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    publishedBy: row.published_by,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(template: InvoiceTemplate): TemplateRow {
  return {
    id: template.id,
    tenant_id: template.tenantId,
    brand_id: template.brandId ?? null,
    name: template.name,
    channel: template.channel,
    status: template.status,
    content_ref: template.contentRef,
    variable_schema_version: template.variableSchemaVersion,
    layout_normative_version: template.layoutNormativeVersion,
    published_at: template.publishedAt ? template.publishedAt.toISOString() : null,
    published_by: template.publishedBy ?? null,
    revision: template.revision,
    created_at: template.createdAt.toISOString(),
    updated_at: template.updatedAt.toISOString(),
  };
}

export class SupabaseInvoiceTemplateRepository implements InvoiceTemplateRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<InvoiceTemplate | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TemplateRow) : null;
  }

  async listByTenant(tenantId: string): Promise<InvoiceTemplate[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as TemplateRow[]).map(fromRow);
  }

  async save(template: InvoiceTemplate): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(template));
    if (error) throw error;
  }
}
