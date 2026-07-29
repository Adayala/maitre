import type { SupabaseClient } from "@supabase/supabase-js";
import type { FiscalEntity, FiscalEntityRepositoryPort } from "@maitre/organization";

const TABLE = "organization_fiscal_entities";

interface FiscalEntityRow {
  id: string;
  tenant_id: string;
  cuit: string;
  name: string;
  legal_name: string | null;
  display_name: string | null;
  legal_address: string | null;
  fiscal_address: string | null;
  activity_code: string | null;
  create_idempotency_key: string | null;
  status: string;
  tax_condition: string;
  certificate_serial: string | null;
  certificate_subject: string | null;
  certificate_issuer: string | null;
  certificate_valid_from: string | null;
  certificate_valid_to: string | null;
  certificate_thumbprint: string | null;
  encrypted_certificate_key_ref: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: FiscalEntityRow): FiscalEntity {
  const hasCertificate =
    row.certificate_serial !== null &&
    row.certificate_subject !== null &&
    row.certificate_issuer !== null &&
    row.certificate_valid_from !== null &&
    row.certificate_valid_to !== null &&
    row.certificate_thumbprint !== null;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    cuit: row.cuit,
    legalName: row.legal_name ?? row.name,
    ...(row.display_name !== null ? { displayName: row.display_name } : {}),
    name: row.name,
    ...(row.legal_address !== null ? { legalAddress: row.legal_address } : {}),
    ...(row.fiscal_address !== null ? { fiscalAddress: row.fiscal_address } : {}),
    ...(row.activity_code !== null ? { activityCode: row.activity_code } : {}),
    ...(row.create_idempotency_key !== null
      ? { createIdempotencyKey: row.create_idempotency_key }
      : {}),
    status: row.status as FiscalEntity["status"],
    taxCondition: row.tax_condition as FiscalEntity["taxCondition"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    ...(row.encrypted_certificate_key_ref !== null
      ? { encryptedCertificateKeyRef: row.encrypted_certificate_key_ref }
      : {}),
    ...(hasCertificate
      ? {
          certificate: {
            serial: row.certificate_serial!,
            subject: row.certificate_subject!,
            issuer: row.certificate_issuer!,
            validFrom: new Date(row.certificate_valid_from!),
            validTo: new Date(row.certificate_valid_to!),
            thumbprint: row.certificate_thumbprint!,
          },
        }
      : {}),
  };
}

function toRow(entity: FiscalEntity): FiscalEntityRow {
  return {
    id: entity.id,
    tenant_id: entity.tenantId,
    cuit: entity.cuit,
    legal_name: entity.legalName ?? entity.name,
    display_name: entity.displayName ?? null,
    name: entity.name,
    legal_address: entity.legalAddress ?? null,
    fiscal_address: entity.fiscalAddress ?? null,
    activity_code: entity.activityCode ?? null,
    create_idempotency_key: entity.createIdempotencyKey ?? null,
    status: entity.status,
    tax_condition: entity.taxCondition,
    certificate_serial: entity.certificate?.serial ?? null,
    certificate_subject: entity.certificate?.subject ?? null,
    certificate_issuer: entity.certificate?.issuer ?? null,
    certificate_valid_from: entity.certificate?.validFrom.toISOString() ?? null,
    certificate_valid_to: entity.certificate?.validTo.toISOString() ?? null,
    certificate_thumbprint: entity.certificate?.thumbprint ?? null,
    encrypted_certificate_key_ref: entity.encryptedCertificateKeyRef ?? null,
    created_at: entity.createdAt.toISOString(),
    created_by: entity.createdBy ?? null,
    updated_at: entity.updatedAt.toISOString(),
    updated_by: entity.updatedBy ?? null,
  };
}

export class SupabaseFiscalEntityRepository implements FiscalEntityRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<FiscalEntity | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as FiscalEntityRow) : null;
  }

  async findByCuit(tenantId: string, cuit: string): Promise<FiscalEntity | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cuit", cuit)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as FiscalEntityRow) : null;
  }

  async findByCreateIdempotencyKey(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<FiscalEntity | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("create_idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as FiscalEntityRow) : null;
  }

  async listByTenant(tenantId: string): Promise<FiscalEntity[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data as FiscalEntityRow[]).map(fromRow);
  }

  async save(entity: FiscalEntity): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(entity));
    if (error) throw error;
  }
}
