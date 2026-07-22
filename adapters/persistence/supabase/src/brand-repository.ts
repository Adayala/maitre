import type { SupabaseClient } from "@supabase/supabase-js";
import type { Brand, BrandRepositoryPort } from "@maitre/organization";

const TABLE = "organization_brands";

interface BrandRow {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  logo_url: string | null;
  website: string | null;
  default_menu_id: string | null;
  config_language: string;
  config_currency: string;
  config_cancellation_policy: string | null;
  config_brand_voice: string | null;
  config_allergen_policy: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  archived_at: string | null;
  archived_by: string | null;
}

function fromRow(row: BrandRow): Brand {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    status: row.status as Brand["status"],
    config: {
      language: row.config_language,
      currency: row.config_currency,
      ...(row.config_cancellation_policy !== null
        ? { cancellationPolicy: row.config_cancellation_policy }
        : {}),
      ...(row.config_brand_voice !== null ? { brandVoice: row.config_brand_voice } : {}),
      ...(row.config_allergen_policy !== null
        ? { allergenPolicy: row.config_allergen_policy }
        : {}),
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.logo_url !== null ? { logoUrl: row.logo_url } : {}),
    ...(row.website !== null ? { website: row.website } : {}),
    ...(row.default_menu_id !== null ? { defaultMenuId: row.default_menu_id } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    ...(row.archived_at !== null ? { archivedAt: new Date(row.archived_at) } : {}),
    ...(row.archived_by !== null ? { archivedBy: row.archived_by } : {}),
  };
}

function toRow(brand: Brand): BrandRow {
  return {
    id: brand.id,
    tenant_id: brand.tenantId,
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? null,
    status: brand.status,
    logo_url: brand.logoUrl ?? null,
    website: brand.website ?? null,
    default_menu_id: brand.defaultMenuId ?? null,
    config_language: brand.config.language,
    config_currency: brand.config.currency,
    config_cancellation_policy: brand.config.cancellationPolicy ?? null,
    config_brand_voice: brand.config.brandVoice ?? null,
    config_allergen_policy: brand.config.allergenPolicy ?? null,
    created_at: brand.createdAt.toISOString(),
    created_by: brand.createdBy ?? null,
    updated_at: brand.updatedAt.toISOString(),
    updated_by: brand.updatedBy ?? null,
    archived_at: brand.archivedAt ? brand.archivedAt.toISOString() : null,
    archived_by: brand.archivedBy ?? null,
  };
}

export class SupabaseBrandRepository implements BrandRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Brand | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BrandRow) : null;
  }

  async findBySlug(tenantId: string, slug: string): Promise<Brand | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BrandRow) : null;
  }

  async listByTenant(tenantId: string): Promise<Brand[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data as BrandRow[]).map(fromRow);
  }

  async save(brand: Brand): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(brand));
    if (error) throw error;
  }
}
