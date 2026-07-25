import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimeAdjustment, TimeAdjustmentRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_time_adjustments";

interface TimeAdjustmentRow {
  id: string;
  tenant_id: string;
  time_entry_id: string;
  request_command_id: string | null;
  decision_command_id: string | null;
  before_clock_in_at: string | null;
  before_clock_out_at: string | null;
  requested_clock_in_at: string | null;
  requested_clock_out_at: string | null;
  after_clock_in_at: string | null;
  after_clock_out_at: string | null;
  reason: string;
  evidence: string | null;
  requester_id: string;
  approver_id: string | null;
  status: string;
  effective_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: TimeAdjustmentRow): TimeAdjustment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    timeEntryId: row.time_entry_id,
    ...(row.request_command_id !== null ? { requestCommandId: row.request_command_id } : {}),
    ...(row.decision_command_id !== null ? { decisionCommandId: row.decision_command_id } : {}),
    ...(row.before_clock_in_at !== null ? { beforeClockInAt: new Date(row.before_clock_in_at) } : {}),
    ...(row.before_clock_out_at !== null ? { beforeClockOutAt: new Date(row.before_clock_out_at) } : {}),
    reason: row.reason,
    requesterId: row.requester_id,
    status: row.status as TimeAdjustment["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.requested_clock_in_at !== null ? { requestedClockInAt: new Date(row.requested_clock_in_at) } : {}),
    ...(row.requested_clock_out_at !== null ? { requestedClockOutAt: new Date(row.requested_clock_out_at) } : {}),
    ...(row.after_clock_in_at !== null ? { afterClockInAt: new Date(row.after_clock_in_at) } : {}),
    ...(row.after_clock_out_at !== null ? { afterClockOutAt: new Date(row.after_clock_out_at) } : {}),
    ...(row.evidence !== null ? { evidence: row.evidence } : {}),
    ...(row.approver_id !== null ? { approverId: row.approver_id } : {}),
    ...(row.effective_at !== null ? { effectiveAt: new Date(row.effective_at) } : {}),
  };
}

function toRow(adjustment: TimeAdjustment): TimeAdjustmentRow {
  return {
    id: adjustment.id,
    tenant_id: adjustment.tenantId,
    time_entry_id: adjustment.timeEntryId,
    request_command_id: adjustment.requestCommandId ?? null,
    decision_command_id: adjustment.decisionCommandId ?? null,
    before_clock_in_at: adjustment.beforeClockInAt ? adjustment.beforeClockInAt.toISOString() : null,
    before_clock_out_at: adjustment.beforeClockOutAt ? adjustment.beforeClockOutAt.toISOString() : null,
    requested_clock_in_at: adjustment.requestedClockInAt ? adjustment.requestedClockInAt.toISOString() : null,
    requested_clock_out_at: adjustment.requestedClockOutAt ? adjustment.requestedClockOutAt.toISOString() : null,
    after_clock_in_at: adjustment.afterClockInAt ? adjustment.afterClockInAt.toISOString() : null,
    after_clock_out_at: adjustment.afterClockOutAt ? adjustment.afterClockOutAt.toISOString() : null,
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

export class SupabaseTimeAdjustmentRepository implements TimeAdjustmentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<TimeAdjustment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TimeAdjustmentRow) : null;
  }

  async listByTimeEntry(tenantId: string, timeEntryId: string): Promise<TimeAdjustment[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("time_entry_id", timeEntryId);
    if (error) throw error;
    return (data as TimeAdjustmentRow[]).map(fromRow);
  }

  async save(adjustment: TimeAdjustment): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(adjustment));
    if (error) throw error;
  }
}
