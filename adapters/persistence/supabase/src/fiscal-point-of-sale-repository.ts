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
  environment: string;
  official_code: string;
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
    environment: row.environment as FiscalEnvironment,
    officialCode: row.official_code,
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
    environment: pos.environment,
    official_code: pos.officialCode,
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
