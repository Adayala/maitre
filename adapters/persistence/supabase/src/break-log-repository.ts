import type { SupabaseClient } from "@supabase/supabase-js";
import type { BreakLog, BreakLogRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_break_logs";

interface BreakLogRow {
  id: string;
  tenant_id: string;
  time_entry_id: string;
  break_type: string;
  paid_classification: string;
  labor_policy_version: string;
  status: string;
  opened_at: string;
  effective_opened_at: string | null;
  closed_at: string | null;
  effective_closed_at: string | null;
  timezone: string;
  source: string;
  device_id: string;
  device_sequence: number;
  opened_command_id: string | null;
  closed_command_id: string | null;
  finding_reason_code: string | null;
  last_approved_adjustment_id: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: BreakLogRow): BreakLog {
  const breakLog: BreakLog = {
    id: row.id,
    tenantId: row.tenant_id,
    timeEntryId: row.time_entry_id,
    breakType: row.break_type as BreakLog["breakType"],
    paidClassification: row.paid_classification as BreakLog["paidClassification"],
    laborPolicyVersion: row.labor_policy_version,
    status: row.status as BreakLog["status"],
    openedAt: new Date(row.opened_at),
    ...(row.effective_opened_at !== null ? { effectiveOpenedAt: new Date(row.effective_opened_at) } : {}),
    timezone: row.timezone,
    source: row.source as BreakLog["source"],
    deviceId: row.device_id,
    deviceSequence: row.device_sequence,
    ...(row.opened_command_id !== null ? { openedCommandId: row.opened_command_id } : {}),
    ...(row.closed_command_id !== null ? { closedCommandId: row.closed_command_id } : {}),
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.closed_at !== null ? { closedAt: new Date(row.closed_at) } : {}),
    ...(row.effective_closed_at !== null ? { effectiveClosedAt: new Date(row.effective_closed_at) } : {}),
    ...(row.last_approved_adjustment_id !== null
      ? { lastApprovedAdjustmentId: row.last_approved_adjustment_id }
      : {}),
  };
  if (row.finding_reason_code !== null) {
    breakLog.findingReasonCode = row.finding_reason_code as NonNullable<BreakLog["findingReasonCode"]>;
  }
  return breakLog;
}

function toRow(breakLog: BreakLog): BreakLogRow {
  return {
    id: breakLog.id,
    tenant_id: breakLog.tenantId,
    time_entry_id: breakLog.timeEntryId,
    break_type: breakLog.breakType,
    paid_classification: breakLog.paidClassification,
    labor_policy_version: breakLog.laborPolicyVersion,
    status: breakLog.status,
    opened_at: breakLog.openedAt.toISOString(),
    effective_opened_at: breakLog.effectiveOpenedAt ? breakLog.effectiveOpenedAt.toISOString() : null,
    closed_at: breakLog.closedAt ? breakLog.closedAt.toISOString() : null,
    effective_closed_at: breakLog.effectiveClosedAt ? breakLog.effectiveClosedAt.toISOString() : null,
    timezone: breakLog.timezone,
    source: breakLog.source,
    device_id: breakLog.deviceId,
    device_sequence: breakLog.deviceSequence,
    opened_command_id: breakLog.openedCommandId ?? null,
    closed_command_id: breakLog.closedCommandId ?? null,
    finding_reason_code: breakLog.findingReasonCode ?? null,
    last_approved_adjustment_id: breakLog.lastApprovedAdjustmentId ?? null,
    revision: breakLog.revision,
    created_at: breakLog.createdAt.toISOString(),
    updated_at: breakLog.updatedAt.toISOString(),
  };
}

export class SupabaseBreakLogRepository implements BreakLogRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<BreakLog | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BreakLogRow) : null;
  }

  async findOpenByTimeEntry(tenantId: string, timeEntryId: string): Promise<BreakLog | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("time_entry_id", timeEntryId)
      .eq("status", "OPEN")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as BreakLogRow) : null;
  }

  async listByTimeEntry(tenantId: string, timeEntryId: string): Promise<BreakLog[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("time_entry_id", timeEntryId);
    if (error) throw error;
    return (data as BreakLogRow[]).map(fromRow);
  }

  async save(breakLog: BreakLog): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(breakLog));
    if (error) throw error;
  }
}
