import type { SupabaseClient } from "@supabase/supabase-js";
import type { BreakAdjustment, BreakAdjustmentRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_break_adjustments";

interface BreakAdjustmentRow {
  id: string;
  tenant_id: string;
  break_log_id: string;
  request_command_id: string | null;
  decision_command_id: string | null;
  before_opened_at: string | null;
  before_closed_at: string | null;
  requested_opened_at: string | null;
  requested_closed_at: string | null;
  after_opened_at: string | null;
  after_closed_at: string | null;
  reason: string;
  evidence: string | null;
  requester_id: string;
  approver_id: string | null;
  status: string;
  effective_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: BreakAdjustmentRow): BreakAdjustment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    breakLogId: row.break_log_id,
    ...(row.request_command_id !== null ? { requestCommandId: row.request_command_id } : {}),
    ...(row.decision_command_id !== null ? { decisionCommandId: row.decision_command_id } : {}),
    reason: row.reason,
    requesterId: row.requester_id,
    status: row.status as BreakAdjustment["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.before_opened_at !== null ? { beforeOpenedAt: new Date(row.before_opened_at) } : {}),
    ...(row.before_closed_at !== null ? { beforeClosedAt: new Date(row.before_closed_at) } : {}),
    ...(row.requested_opened_at !== null ? { requestedOpenedAt: new Date(row.requested_opened_at) } : {}),
    ...(row.requested_closed_at !== null ? { requestedClosedAt: new Date(row.requested_closed_at) } : {}),
    ...(row.after_opened_at !== null ? { afterOpenedAt: new Date(row.after_opened_at) } : {}),
    ...(row.after_closed_at !== null ? { afterClosedAt: new Date(row.after_closed_at) } : {}),
    ...(row.evidence !== null ? { evidence: row.evidence } : {}),
    ...(row.approver_id !== null ? { approverId: row.approver_id } : {}),
    ...(row.effective_at !== null ? { effectiveAt: new Date(row.effective_at) } : {}),
  };
}

function toRow(adjustment: BreakAdjustment): BreakAdjustmentRow {
  return {
    id: adjustment.id,
    tenant_id: adjustment.tenantId,
    break_log_id: adjustment.breakLogId,
    request_command_id: adjustment.requestCommandId ?? null,
    decision_command_id: adjustment.decisionCommandId ?? null,
    before_opened_at: adjustment.beforeOpenedAt ? adjustment.beforeOpenedAt.toISOString() : null,
    before_closed_at: adjustment.beforeClosedAt ? adjustment.beforeClosedAt.toISOString() : null,
    requested_opened_at: adjustment.requestedOpenedAt ? adjustment.requestedOpenedAt.toISOString() : null,
    requested_closed_at: adjustment.requestedClosedAt ? adjustment.requestedClosedAt.toISOString() : null,
    after_opened_at: adjustment.afterOpenedAt ? adjustment.afterOpenedAt.toISOString() : null,
    after_closed_at: adjustment.afterClosedAt ? adjustment.afterClosedAt.toISOString() : null,
    reason: adjustment.reason,
    evidence: adjustment.evidence ?? null,
    requester_id: adjustment.requesterId,
    approver_id: adjustment.approverId ?? null,
    status: adjustment.status,
    effective_at: adjustment.effectiveAt ? adjustment.effectiveAt.toISOString() : null,
    created_at: adjustment.createdAt.toISOString(),
    updated_at: adjustment.updatedAt.toISOString(),
  };
}

export class SupabaseBreakAdjustmentRepository implements BreakAdjustmentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<BreakAdjustment | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BreakAdjustmentRow) : null;
  }

  async listByBreakLog(tenantId: string, breakLogId: string): Promise<BreakAdjustment[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("break_log_id", breakLogId);
    if (error) throw error;
    return (data as BreakAdjustmentRow[]).map(fromRow);
  }

  async save(adjustment: BreakAdjustment): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(adjustment));
    if (error) throw error;
  }
}
