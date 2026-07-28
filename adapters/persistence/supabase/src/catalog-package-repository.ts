import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CatalogPackage,
  CatalogPackageItem,
  CatalogPackageRepositoryPort,
} from "@maitre/subscription";

const TABLE = "subscription_catalog_packages";

interface CatalogPackageRow {
  code: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  items: CatalogPackageItem[];
  is_active: boolean;
  sort_order: number;
  version: number;
}

function fromRow(row: CatalogPackageRow): CatalogPackage {
  return {
    code: row.code,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    benefits: row.benefits,
    items: row.items,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    version: row.version,
  };
}

export class SupabaseCatalogPackageRepository implements CatalogPackageRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listActive(): Promise<CatalogPackage[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data as CatalogPackageRow[]).map(fromRow);
  }

  async findByCode(code: string): Promise<CatalogPackage | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CatalogPackageRow) : null;
  }

  async save(catalogPackage: CatalogPackage): Promise<void> {
    const row: CatalogPackageRow = {
      code: catalogPackage.code,
      name: catalogPackage.name,
      tagline: catalogPackage.tagline,
      description: catalogPackage.description,
      benefits: catalogPackage.benefits,
      items: catalogPackage.items,
      is_active: catalogPackage.isActive,
      sort_order: catalogPackage.sortOrder,
      version: catalogPackage.version,
    };
    const { error } = await this.client.from(TABLE).upsert(row);
    if (error) throw error;
  }
}
