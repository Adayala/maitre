import type { SupabaseClient } from "@supabase/supabase-js";
import type { SpecialRequest, SpecialRequestRepositoryPort } from "@maitre/ordering";

const TABLE = "ordering_special_requests";

interface SpecialRequestRow {
  id: string;
  tenant_id: string;
  branch_id: string | null;
  request_type: string;
  target_type: string;
  target_id: string;
  status: string;
  free_text: string | null;
  created_by_actor: string | null;
  resolved_by_actor: string | null;
  reason_code: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

function fromRow(row: SpecialRequestRow): SpecialRequest {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    requestType: row.request_type,
    targetType: row.target_type as SpecialRequest["targetType"],
    targetId: row.target_id,
    status: row.status as SpecialRequest["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.branch_id !== null ? { branchId: row.branch_id } : {}),
    ...(row.free_text !== null ? { freeText: row.free_text } : {}),
    ...(row.created_by_actor !== null ? { createdByActor: row.created_by_actor } : {}),
    ...(row.resolved_by_actor !== null ? { resolvedByActor: row.resolved_by_actor } : {}),
    ...(row.reason_code !== null ? { reasonCode: row.reason_code } : {}),
    ...(row.resolved_at !== null ? { resolvedAt: new Date(row.resolved_at) } : {}),
  };
}

function toRow(request: SpecialRequest): SpecialRequestRow {
  return {
    id: request.id,
    tenant_id: request.tenantId,
    branch_id: request.branchId ?? null,
    request_type: request.requestType,
    target_type: request.targetType,
    target_id: request.targetId,
    status: request.status,
    free_text: request.freeText ?? null,
    created_by_actor: request.createdByActor ?? null,
    resolved_by_actor: request.resolvedByActor ?? null,
    reason_code: request.reasonCode ?? null,
    revision: request.revision,
    created_at: request.createdAt.toISOString(),
    updated_at: request.updatedAt.toISOString(),
    resolved_at: request.resolvedAt ? request.resolvedAt.toISOString() : null,
  };
}

export class SupabaseSpecialRequestRepository implements SpecialRequestRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<SpecialRequest | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SpecialRequestRow) : null;
  }

  async listByTarget(tenantId: string, targetType: string, targetId: string): Promise<SpecialRequest[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (error) throw error;
    return (data as SpecialRequestRow[]).map(fromRow);
  }

  async save(request: SpecialRequest): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(request));
    if (error) throw error;
  }
}
