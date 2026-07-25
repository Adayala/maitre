import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LaborPolicyVersionRecord,
  LaborPolicyVersionRepositoryPort,
} from "./labor-policy-repository.js";

const TABLE = "workforce_labor_policy_versions";

interface LaborPolicyVersionRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  jurisdiction_code: string;
  source_type: "OFFICIAL" | "COUNSEL" | "INTERNAL_APPROVED_REFERENCE";
  source_ref: string;
  consulted_at: string;
  effective_from: string;
  effective_until: string | null;
  content_hash: string;
  reviewer_ref: string;
  approved_at: string;
  supersedes_policy_version_id: string | null;
  policy_capabilities: LaborPolicyVersionRecord["policyCapabilities"];
  disclaimer: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: LaborPolicyVersionRow): LaborPolicyVersionRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    jurisdictionCode: row.jurisdiction_code,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    consultedAt: new Date(row.consulted_at),
    effectiveFrom: new Date(row.effective_from),
    effectiveUntil: row.effective_until ? new Date(row.effective_until) : null,
    contentHash: row.content_hash,
    reviewerRef: row.reviewer_ref,
    approvedAt: new Date(row.approved_at),
    supersedesPolicyVersionId: row.supersedes_policy_version_id,
    policyCapabilities: row.policy_capabilities,
    disclaimer: row.disclaimer,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(policy: LaborPolicyVersionRecord): LaborPolicyVersionRow {
  return {
    id: policy.id,
    tenant_id: policy.tenantId,
    branch_id: policy.branchId,
    jurisdiction_code: policy.jurisdictionCode,
    source_type: policy.sourceType,
    source_ref: policy.sourceRef,
    consulted_at: policy.consultedAt.toISOString(),
    effective_from: policy.effectiveFrom.toISOString(),
    effective_until: policy.effectiveUntil ? policy.effectiveUntil.toISOString() : null,
    content_hash: policy.contentHash,
    reviewer_ref: policy.reviewerRef,
    approved_at: policy.approvedAt.toISOString(),
    supersedes_policy_version_id: policy.supersedesPolicyVersionId ?? null,
    policy_capabilities: policy.policyCapabilities,
    disclaimer: policy.disclaimer,
    created_at: policy.createdAt.toISOString(),
    updated_at: policy.updatedAt.toISOString(),
  };
}

export class SupabaseLaborPolicyVersionRepository implements LaborPolicyVersionRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<LaborPolicyVersionRecord | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as LaborPolicyVersionRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<LaborPolicyVersionRecord[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("effective_from", { ascending: false });
    if (error) throw error;
    return ((data as LaborPolicyVersionRow[]) ?? []).map(fromRow);
  }

  async save(policy: LaborPolicyVersionRecord): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(policy));
    if (error) throw error;
  }
}
