import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FiscalCertificate,
  FiscalCertificateEnvironment,
  FiscalCertificateRepositoryPort,
} from "@maitre/fiscal";

const TABLE = "fiscal_certificates";

interface CertRow {
  id: string;
  tenant_id: string;
  fiscal_entity_id: string;
  cuit: string;
  service: string;
  environment: string;
  fingerprint: string;
  issuer: string;
  not_before: string;
  not_after: string;
  status: string;
  secret_reference: string;
  rotated_at: string | null;
  superseded_by: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CertRow): FiscalCertificate {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    fiscalEntityId: row.fiscal_entity_id,
    cuit: row.cuit,
    service: row.service,
    environment: row.environment as FiscalCertificateEnvironment,
    fingerprint: row.fingerprint,
    issuer: row.issuer,
    notBefore: new Date(row.not_before),
    notAfter: new Date(row.not_after),
    status: row.status as FiscalCertificate["status"],
    secretReference: row.secret_reference,
    rotatedAt: row.rotated_at ? new Date(row.rotated_at) : null,
    supersededBy: row.superseded_by,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(cert: FiscalCertificate): CertRow {
  return {
    id: cert.id,
    tenant_id: cert.tenantId,
    fiscal_entity_id: cert.fiscalEntityId,
    cuit: cert.cuit,
    service: cert.service,
    environment: cert.environment,
    fingerprint: cert.fingerprint,
    issuer: cert.issuer,
    not_before: cert.notBefore.toISOString(),
    not_after: cert.notAfter.toISOString(),
    status: cert.status,
    secret_reference: cert.secretReference,
    rotated_at: cert.rotatedAt ? cert.rotatedAt.toISOString() : null,
    superseded_by: cert.supersededBy ?? null,
    revision: cert.revision,
    created_at: cert.createdAt.toISOString(),
    updated_at: cert.updatedAt.toISOString(),
  };
}

export class SupabaseFiscalCertificateRepository implements FiscalCertificateRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<FiscalCertificate | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CertRow) : null;
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalCertificate[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("fiscal_entity_id", fiscalEntityId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as CertRow[]).map(fromRow);
  }

  async save(cert: FiscalCertificate): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(cert));
    if (error) throw error;
  }
}
