import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FiscalPointOfSale,
  FiscalEnvironment,
  VoucherType,
  FiscalPointOfSaleRepositoryPort,
} from "@maitre/fiscal";

const TABLE = "fiscal_points_of_sale";

interface PosRow {
  id: string;
  tenant_id: string;
  fiscal_entity_id: string;
  branch_id: string | null;
  environment: string;
  official_code: string;
  arca_domicile_code: string | null;
  arca_domicile_label: string | null;
  issuing_system: string;
  registration_status: string;
  registration_evidence_ref: string | null;
  declared_at: string | null;
  declared_by: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  allowed_voucher_types: unknown;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: PosRow): FiscalPointOfSale {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    fiscalEntityId: row.fiscal_entity_id,
    ...(row.branch_id ? { branchId: row.branch_id } : {}),
    environment: row.environment as FiscalEnvironment,
    officialCode: row.official_code,
    ...(row.arca_domicile_code ? { arcaDomicileCode: row.arca_domicile_code } : {}),
    ...(row.arca_domicile_label ? { arcaDomicileLabel: row.arca_domicile_label } : {}),
    issuingSystem: row.issuing_system as NonNullable<FiscalPointOfSale["issuingSystem"]>,
    registrationStatus: row.registration_status as NonNullable<
      FiscalPointOfSale["registrationStatus"]
    >,
    ...(row.registration_evidence_ref
      ? { registrationEvidenceRef: row.registration_evidence_ref }
      : {}),
    ...(row.declared_at ? { declaredAt: new Date(row.declared_at) } : {}),
    ...(row.declared_by ? { declaredBy: row.declared_by } : {}),
    ...(row.verified_at ? { verifiedAt: new Date(row.verified_at) } : {}),
    ...(row.verified_by ? { verifiedBy: row.verified_by } : {}),
    ...(row.rejection_reason ? { rejectionReason: row.rejection_reason } : {}),
    allowedVoucherTypes: (row.allowed_voucher_types as VoucherType[]) ?? [],
    status: row.status as FiscalPointOfSale["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(pos: FiscalPointOfSale): PosRow {
  return {
    id: pos.id,
    tenant_id: pos.tenantId,
    fiscal_entity_id: pos.fiscalEntityId,
    branch_id: pos.branchId ?? null,
    environment: pos.environment,
    official_code: pos.officialCode,
    arca_domicile_code: pos.arcaDomicileCode ?? null,
    arca_domicile_label: pos.arcaDomicileLabel ?? null,
    issuing_system: pos.issuingSystem ?? "WSFEV1",
    registration_status: pos.registrationStatus ?? "DECLARED",
    registration_evidence_ref: pos.registrationEvidenceRef ?? null,
    declared_at: pos.declaredAt?.toISOString() ?? null,
    declared_by: pos.declaredBy ?? null,
    verified_at: pos.verifiedAt?.toISOString() ?? null,
    verified_by: pos.verifiedBy ?? null,
    rejection_reason: pos.rejectionReason ?? null,
    allowed_voucher_types: pos.allowedVoucherTypes,
    status: pos.status,
    revision: pos.revision,
    created_at: pos.createdAt.toISOString(),
    updated_at: pos.updatedAt.toISOString(),
  };
}

export class SupabaseFiscalPointOfSaleRepository implements FiscalPointOfSaleRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<FiscalPointOfSale | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PosRow) : null;
  }

  async findByIdentity(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    officialCode: string,
  ): Promise<FiscalPointOfSale | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("fiscal_entity_id", fiscalEntityId)
      .eq("environment", environment)
      .eq("official_code", officialCode)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PosRow) : null;
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalPointOfSale[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("fiscal_entity_id", fiscalEntityId)
      .order("official_code", { ascending: true });
    if (error) throw error;
    return (data as PosRow[]).map(fromRow);
  }

  async save(pos: FiscalPointOfSale): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(pos));
    if (error) throw error;
  }
}
