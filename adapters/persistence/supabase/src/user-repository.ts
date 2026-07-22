import type { SupabaseClient } from "@supabase/supabase-js";
import type { User, UserRepositoryPort } from "@maitre/identity";

const TABLE = "identity_users";

interface UserRow {
  id: string;
  identity_provider: string;
  external_identity_id: string;
  display_name: string;
  email: string | null;
  status: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  suspended_at: string | null;
  deactivated_at: string | null;
}

function fromRow(row: UserRow): User {
  return {
    id: row.id,
    identityProvider: row.identity_provider,
    externalIdentityId: row.external_identity_id,
    displayName: row.display_name,
    email: row.email,
    status: row.status as User["status"],
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    updatedAt: new Date(row.updated_at),
    updatedBy: row.updated_by,
    suspendedAt: row.suspended_at ? new Date(row.suspended_at) : null,
    deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at) : null,
  };
}

function toRow(user: User): UserRow {
  return {
    id: user.id,
    identity_provider: user.identityProvider,
    external_identity_id: user.externalIdentityId,
    display_name: user.displayName,
    email: user.email ?? null,
    status: user.status,
    created_at: user.createdAt.toISOString(),
    created_by: user.createdBy ?? null,
    updated_at: user.updatedAt.toISOString(),
    updated_by: user.updatedBy ?? null,
    suspended_at: user.suspendedAt ? user.suspendedAt.toISOString() : null,
    deactivated_at: user.deactivatedAt ? user.deactivatedAt.toISOString() : null,
  };
}

export class SupabaseUserRepository implements UserRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findByExternalIdentity(provider: string, subject: string): Promise<User | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("identity_provider", provider)
      .eq("external_identity_id", subject)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as UserRow) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as UserRow) : null;
  }

  async save(user: User): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(user));
    if (error) throw error;
  }
}
