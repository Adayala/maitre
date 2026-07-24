import type { SupabaseClient } from "@supabase/supabase-js";
import type { CapabilityToken, CapabilityTokenRepositoryPort } from "@maitre/ordering";

const TABLE = "ordering_capability_tokens";

interface CapabilityTokenRow {
  id: string;
  tenant_id: string;
  purpose: string;
  token_hash: string;
  resource_type: string;
  resource_id: string;
  branch_id: string | null;
  table_id: string | null;
  status: string;
  issued_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CapabilityTokenRow): CapabilityToken {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    purpose: row.purpose as CapabilityToken["purpose"],
    tokenHash: row.token_hash,
    resourceType: row.resource_type as CapabilityToken["resourceType"],
    resourceId: row.resource_id,
    status: row.status as CapabilityToken["status"],
    issuedAt: new Date(row.issued_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.branch_id !== null ? { branchId: row.branch_id } : {}),
    ...(row.table_id !== null ? { tableId: row.table_id } : {}),
    ...(row.expires_at !== null ? { expiresAt: new Date(row.expires_at) } : {}),
    ...(row.revoked_at !== null ? { revokedAt: new Date(row.revoked_at) } : {}),
  };
}

function toRow(token: CapabilityToken): CapabilityTokenRow {
  return {
    id: token.id,
    tenant_id: token.tenantId,
    purpose: token.purpose,
    token_hash: token.tokenHash,
    resource_type: token.resourceType,
    resource_id: token.resourceId,
    branch_id: token.branchId ?? null,
    table_id: token.tableId ?? null,
    status: token.status,
    issued_at: token.issuedAt.toISOString(),
    expires_at: token.expiresAt ? token.expiresAt.toISOString() : null,
    revoked_at: token.revokedAt ? token.revokedAt.toISOString() : null,
    created_at: token.createdAt.toISOString(),
    updated_at: token.updatedAt.toISOString(),
  };
}

export class SupabaseCapabilityTokenRepository implements CapabilityTokenRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CapabilityToken | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CapabilityTokenRow) : null;
  }

  // Tenant-agnostic lookup by hash: public callers present no tenant, and the
  // 256-bit hash is globally unique. RLS is bypassed by the service role here,
  // which is required for the anonymous public resolve path.
  async findByHash(tokenHash: string): Promise<CapabilityToken | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CapabilityTokenRow) : null;
  }

  async save(token: CapabilityToken): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(token));
    if (error) throw error;
  }
}
