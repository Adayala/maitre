import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaxRate, TaxTreatment, TaxRateStatus, TaxRateRepositoryPort } from "@maitre/fiscal";

// Platform-level catalogue (not tenant-scoped): fiscal_tax_rates has no tenant_id.
const TABLE = "fiscal_tax_rates";

interface TaxRateRow {
  id: string;
  jurisdiction: string;
  tax_type: string;
  official_code: string;
  treatment: string;
  decimal_rate: number;
  included_in_price: boolean;
  effective_from: string;
  effective_to: string | null;
  normative_source_version: string;
  status: string;
  supersedes: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: TaxRateRow): TaxRate {
  return {
    id: row.id,
    jurisdiction: row.jurisdiction,
    taxType: row.tax_type,
    officialCode: row.official_code,
    treatment: row.treatment as TaxTreatment,
    decimalRate: row.decimal_rate,
    includedInPrice: row.included_in_price,
    effectiveFrom: new Date(row.effective_from),
    effectiveTo: row.effective_to ? new Date(row.effective_to) : null,
    normativeSourceVersion: row.normative_source_version,
    status: row.status as TaxRateStatus,
    supersedes: row.supersedes,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(rate: TaxRate): TaxRateRow {
  return {
    id: rate.id,
    jurisdiction: rate.jurisdiction,
    tax_type: rate.taxType,
    official_code: rate.officialCode,
    treatment: rate.treatment,
    decimal_rate: rate.decimalRate,
    included_in_price: rate.includedInPrice,
    effective_from: rate.effectiveFrom.toISOString(),
    effective_to: rate.effectiveTo ? rate.effectiveTo.toISOString() : null,
    normative_source_version: rate.normativeSourceVersion,
    status: rate.status,
    supersedes: rate.supersedes ?? null,
    revision: rate.revision,
    created_at: rate.createdAt.toISOString(),
    updated_at: rate.updatedAt.toISOString(),
  };
}

export class SupabaseTaxRateRepository implements TaxRateRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<TaxRate | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TaxRateRow) : null;
  }

  async listAll(): Promise<TaxRate[]> {
    const { data, error } = await this.client.from(TABLE).select("*").order("effective_from", { ascending: true });
    if (error) throw error;
    return (data as TaxRateRow[]).map(fromRow);
  }

  async listByKey(jurisdiction: string, taxType: string, officialCode: string): Promise<TaxRate[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("jurisdiction", jurisdiction)
      .eq("tax_type", taxType)
      .eq("official_code", officialCode);
    if (error) throw error;
    return (data as TaxRateRow[]).map(fromRow);
  }

  async save(rate: TaxRate): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(rate));
    if (error) throw error;
  }
}
