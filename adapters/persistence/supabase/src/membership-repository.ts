import type { SupabaseClient } from "@supabase/supabase-js";
import type { Membership, MembershipRepositoryPort } from "@maitre/identity";

const TABLE = "identity_memberships";
const ROLES_TABLE = "identity_membership_roles";
const BRANCHES_TABLE = "identity_membership_branches";

interface MembershipRow {
  id: string;
  tenant_id: string;
  user_id: string;
  status: string;
  branch_scope_type: string;
  invited_at: string | null;
  activated_at: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  identity_membership_roles?: { role_id: string }[];
  identity_membership_branches?: { branch_id: string }[];
}

function fromRow(row: MembershipRow): Membership {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    status: row.status as Membership["status"],
    branchScopeType: row.branch_scope_type as Membership["branchScopeType"],
    roleIds: (row.identity_membership_roles ?? []).map((r) => r.role_id),
    branchIds: (row.identity_membership_branches ?? []).map((b) => b.branch_id),
    invitedAt: row.invited_at ? new Date(row.invited_at) : null,
    activatedAt: row.activated_at ? new Date(row.activated_at) : null,
    suspendedAt: row.suspended_at ? new Date(row.suspended_at) : null,
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    updatedAt: new Date(row.updated_at),
    updatedBy: row.updated_by,
  };
}

function toRow(membership: Membership): Omit<
  MembershipRow,
  "identity_membership_roles" | "identity_membership_branches"
> {
  return {
    id: membership.id,
    tenant_id: membership.tenantId,
    user_id: membership.userId,
    status: membership.status,
    branch_scope_type: membership.branchScopeType,
    invited_at: membership.invitedAt ? membership.invitedAt.toISOString() : null,
    activated_at: membership.activatedAt ? membership.activatedAt.toISOString() : null,
    suspended_at: membership.suspendedAt ? membership.suspendedAt.toISOString() : null,
    revoked_at: membership.revokedAt ? membership.revokedAt.toISOString() : null,
    created_at: membership.createdAt.toISOString(),
    created_by: membership.createdBy ?? null,
    updated_at: membership.updatedAt.toISOString(),
    updated_by: membership.updatedBy ?? null,
  };
}

const SELECT_WITH_CHILDREN = `*, ${ROLES_TABLE}(role_id), ${BRANCHES_TABLE}(branch_id)`;

export class SupabaseMembershipRepository implements MembershipRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveByUser(userId: string): Promise<Membership[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_CHILDREN)
      .eq("user_id", userId)
      .eq("status", "ACTIVE");
    if (error) throw error;
    return (data as unknown as MembershipRow[]).map(fromRow);
  }

  async findActiveByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<Membership | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_CHILDREN)
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as unknown as MembershipRow) : null;
  }

  async listByTenant(tenantId: string): Promise<Membership[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_CHILDREN)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data as unknown as MembershipRow[]).map(fromRow);
  }

  async findById(tenantId: string, id: string): Promise<Membership | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_CHILDREN)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as unknown as MembershipRow) : null;
  }

  /**
   * Not atomic across the three tables (PostgREST issues separate HTTP
   * requests); acceptable for I0. A real production adapter should do this
   * inside a single Postgres transaction (e.g. via an RPC function) once
   * membership mutation frequency justifies it.
   */
  async save(membership: Membership): Promise<void> {
    const { error: upsertError } = await this.client.from(TABLE).upsert(toRow(membership));
    if (upsertError) throw upsertError;

    const { error: deleteRolesError } = await this.client
      .from(ROLES_TABLE)
      .delete()
      .eq("membership_id", membership.id);
    if (deleteRolesError) throw deleteRolesError;

    if (membership.roleIds.length > 0) {
      const { error: insertRolesError } = await this.client.from(ROLES_TABLE).insert(
        membership.roleIds.map((roleId) => ({
          membership_id: membership.id,
          role_id: roleId,
        })),
      );
      if (insertRolesError) throw insertRolesError;
    }

    const { error: deleteBranchesError } = await this.client
      .from(BRANCHES_TABLE)
      .delete()
      .eq("membership_id", membership.id);
    if (deleteBranchesError) throw deleteBranchesError;

    if (membership.branchIds.length > 0) {
      const { error: insertBranchesError } = await this.client.from(BRANCHES_TABLE).insert(
        membership.branchIds.map((branchId) => ({
          membership_id: membership.id,
          branch_id: branchId,
        })),
      );
      if (insertBranchesError) throw insertBranchesError;
    }
  }
}
