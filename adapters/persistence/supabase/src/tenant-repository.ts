import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tenant, TenantRepositoryPort } from "@maitre/organization";

const TABLE = "organization_tenants";

interface TenantRow {
  id: string;
  name: string;
  status: string;
  default_locale: string;
  default_currency: string;
  default_timezone: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Tenant["status"],
    defaultLocale: row.default_locale,
    defaultCurrency: row.default_currency,
    defaultTimezone: row.default_timezone,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.contact_email !== null ? { contactEmail: row.contact_email } : {}),
    ...(row.contact_phone !== null ? { contactPhone: row.contact_phone } : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
  };
}

function toRow(tenant: Tenant): TenantRow {
  return {
    id: tenant.id,
    name: tenant.name,
    status: tenant.status,
    default_locale: tenant.defaultLocale,
    default_currency: tenant.defaultCurrency,
    default_timezone: tenant.defaultTimezone,
    contact_email: tenant.contactEmail ?? null,
    contact_phone: tenant.contactPhone ?? null,
    created_at: tenant.createdAt.toISOString(),
    created_by: tenant.createdBy ?? null,
    updated_at: tenant.updatedAt.toISOString(),
    updated_by: tenant.updatedBy ?? null,
  };
}

export class SupabaseTenantRepository implements TenantRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TenantRow) : null;
  }

  async save(tenant: Tenant): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(tenant));
    if (error) throw error;
  }
}
