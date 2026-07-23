import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductRepositoryPort } from "@maitre/catalog";

const TABLE = "catalog_products";

interface ProductRow {
  id: string;
  tenant_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_minor_units: number;
  currency: string;
  image_url: string | null;
  status: string;
  allergens: string[];
  nutritional_calories: number | null;
  nutritional_protein: number | null;
  display_order: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: ProductRow): Product {
  const hasNutritional = row.nutritional_calories !== null || row.nutritional_protein !== null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    priceMinorUnits: row.price_minor_units,
    currency: row.currency,
    status: row.status as Product["status"],
    allergens: row.allergens,
    displayOrder: row.display_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.image_url !== null ? { imageUrl: row.image_url } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    ...(hasNutritional
      ? {
          nutritional: {
            ...(row.nutritional_calories !== null
              ? { calories: row.nutritional_calories }
              : {}),
            ...(row.nutritional_protein !== null ? { protein: row.nutritional_protein } : {}),
          },
        }
      : {}),
  };
}

function toRow(product: Product): ProductRow {
  return {
    id: product.id,
    tenant_id: product.tenantId,
    category_id: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    price_minor_units: product.priceMinorUnits,
    currency: product.currency,
    image_url: product.imageUrl ?? null,
    status: product.status,
    allergens: product.allergens,
    nutritional_calories: product.nutritional?.calories ?? null,
    nutritional_protein: product.nutritional?.protein ?? null,
    display_order: product.displayOrder,
    created_at: product.createdAt.toISOString(),
    created_by: product.createdBy ?? null,
    updated_at: product.updatedAt.toISOString(),
    updated_by: product.updatedBy ?? null,
  };
}

export class SupabaseProductRepository implements ProductRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ProductRow) : null;
  }

  async listByCategory(tenantId: string, categoryId: string): Promise<Product[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("category_id", categoryId);
    if (error) throw error;
    return (data as ProductRow[]).map(fromRow);
  }

  async save(product: Product): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(product));
    if (error) throw error;
  }
}
