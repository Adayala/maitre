import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, CategoryRepositoryPort } from "@maitre/catalog";

const TABLE = "catalog_categories";

interface CategoryRow {
  id: string;
  tenant_id: string;
  brand_id: string;
  menu_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  status: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    menuId: row.menu_id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.display_order,
    status: row.status as Category["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
  };
}

function toRow(category: Category): CategoryRow {
  return {
    id: category.id,
    tenant_id: category.tenantId,
    brand_id: category.brandId,
    menu_id: category.menuId,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    display_order: category.displayOrder,
    status: category.status,
    created_at: category.createdAt.toISOString(),
    created_by: category.createdBy ?? null,
    updated_at: category.updatedAt.toISOString(),
    updated_by: category.updatedBy ?? null,
  };
}

export class SupabaseCategoryRepository implements CategoryRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CategoryRow) : null;
  }

  async listByMenu(tenantId: string, menuId: string): Promise<Category[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("menu_id", menuId);
    if (error) throw error;
    return (data as CategoryRow[]).map(fromRow);
  }

  async save(category: Category): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(category));
    if (error) throw error;
  }
}
