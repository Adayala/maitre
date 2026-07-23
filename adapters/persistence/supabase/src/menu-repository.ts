import type { SupabaseClient } from "@supabase/supabase-js";
import type { Menu, MenuRepositoryPort } from "@maitre/catalog";

const TABLE = "catalog_menus";

interface MenuRow {
  id: string;
  tenant_id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  is_default: boolean;
  display_order: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: MenuRow): Menu {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    name: row.name,
    slug: row.slug,
    status: row.status as Menu["status"],
    isDefault: row.is_default,
    displayOrder: row.display_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
  };
}

function toRow(menu: Menu): MenuRow {
  return {
    id: menu.id,
    tenant_id: menu.tenantId,
    brand_id: menu.brandId,
    name: menu.name,
    slug: menu.slug,
    description: menu.description ?? null,
    status: menu.status,
    is_default: menu.isDefault,
    display_order: menu.displayOrder,
    created_at: menu.createdAt.toISOString(),
    created_by: menu.createdBy ?? null,
    updated_at: menu.updatedAt.toISOString(),
    updated_by: menu.updatedBy ?? null,
  };
}

export class SupabaseMenuRepository implements MenuRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Menu | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as MenuRow) : null;
  }

  async findBySlug(tenantId: string, brandId: string, slug: string): Promise<Menu | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("brand_id", brandId)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as MenuRow) : null;
  }

  async listByBrand(tenantId: string, brandId: string): Promise<Menu[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("brand_id", brandId);
    if (error) throw error;
    return (data as MenuRow[]).map(fromRow);
  }

  async save(menu: Menu): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(menu));
    if (error) throw error;
  }
}
