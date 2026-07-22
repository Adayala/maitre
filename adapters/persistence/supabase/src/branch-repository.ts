import type { SupabaseClient } from "@supabase/supabase-js";
import type { Branch, BranchRepositoryPort } from "@maitre/organization";

const TABLE = "organization_branches";

interface BranchRow {
  id: string;
  tenant_id: string;
  brand_id: string;
  fiscal_entity_id: string | null;
  code: string;
  name: string;
  timezone: string;
  status: string;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_subdivision: string | null;
  address_postal_code: string | null;
  address_country_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: BranchRow): Branch {
  const hasAddress = row.address_line1 !== null && row.address_city !== null && row.address_country_code !== null;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    code: row.code,
    name: row.name,
    timezone: row.timezone,
    status: row.status as Branch["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.fiscal_entity_id !== null ? { fiscalEntityId: row.fiscal_entity_id } : {}),
    ...(row.contact_email !== null ? { contactEmail: row.contact_email } : {}),
    ...(row.contact_phone !== null ? { contactPhone: row.contact_phone } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    ...(hasAddress
      ? {
          address: {
            line1: row.address_line1!,
            city: row.address_city!,
            countryCode: row.address_country_code!,
            ...(row.address_line2 !== null ? { line2: row.address_line2 } : {}),
            ...(row.address_subdivision !== null
              ? { subdivision: row.address_subdivision }
              : {}),
            ...(row.address_postal_code !== null
              ? { postalCode: row.address_postal_code }
              : {}),
          },
        }
      : {}),
  };
}

function toRow(branch: Branch): BranchRow {
  return {
    id: branch.id,
    tenant_id: branch.tenantId,
    brand_id: branch.brandId,
    fiscal_entity_id: branch.fiscalEntityId ?? null,
    code: branch.code,
    name: branch.name,
    timezone: branch.timezone,
    status: branch.status,
    address_line1: branch.address?.line1 ?? null,
    address_line2: branch.address?.line2 ?? null,
    address_city: branch.address?.city ?? null,
    address_subdivision: branch.address?.subdivision ?? null,
    address_postal_code: branch.address?.postalCode ?? null,
    address_country_code: branch.address?.countryCode ?? null,
    contact_email: branch.contactEmail ?? null,
    contact_phone: branch.contactPhone ?? null,
    created_at: branch.createdAt.toISOString(),
    created_by: branch.createdBy ?? null,
    updated_at: branch.updatedAt.toISOString(),
    updated_by: branch.updatedBy ?? null,
  };
}

export class SupabaseBranchRepository implements BranchRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Branch | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BranchRow) : null;
  }

  async findByCode(tenantId: string, code: string): Promise<Branch | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BranchRow) : null;
  }

  async listByTenant(tenantId: string): Promise<Branch[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data as BranchRow[]).map(fromRow);
  }

  async save(branch: Branch): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(branch));
    if (error) throw error;
  }
}
