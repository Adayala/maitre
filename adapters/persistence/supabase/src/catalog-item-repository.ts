import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalogItem, CatalogRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_catalog_items";

interface CatalogItemRow {
  code: string;
  name: string;
  billing_type: string;
  billing_scope: string;
  unit_price: number;
  currency: string;
  period: string;
  depends_on: string[];
  is_active: boolean;
  version: number;
}

function fromRow(row: CatalogItemRow): CatalogItem {
  return {
    code: row.code,
    name: row.name,
    billingType: row.billing_type as CatalogItem["billingType"],
    billingScope: row.billing_scope as CatalogItem["billingScope"],
    unitPrice: row.unit_price,
    currency: row.currency,
    period: row.period as CatalogItem["period"],
    dependsOn: row.depends_on,
    isActive: row.is_active,
    version: row.version,
  };
}

export class SupabaseCatalogItemRepository implements CatalogRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listActive(): Promise<CatalogItem[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("is_active", true);
    if (error) throw error;
    return (data as CatalogItemRow[]).map(fromRow);
  }

  async findByCode(code: string): Promise<CatalogItem | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CatalogItemRow) : null;
  }

  async save(item: CatalogItem): Promise<void> {
    const row: CatalogItemRow = {
      code: item.code,
      name: item.name,
      billing_type: item.billingType,
      billing_scope: item.billingScope,
      unit_price: item.unitPrice,
      currency: item.currency,
      period: item.period,
      depends_on: item.dependsOn,
      is_active: item.isActive,
      version: item.version,
    };
    const { error } = await this.client.from(TABLE).upsert(row);
    if (error) throw error;
  }
}
