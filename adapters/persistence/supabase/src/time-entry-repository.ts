import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimeEntry, TimeEntryRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_time_entries";

interface TimeEntryRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  employment_id: string;
  shift_assignment_id: string | null;
  status: string;
  captured_at: string;
  effective_captured_at: string | null;
  received_at: string;
  closed_captured_at: string | null;
  effective_closed_captured_at: string | null;
  closed_received_at: string | null;
  timezone: string;
  source: string;
  device_id: string;
  device_sequence: number;
  opened_command_id: string | null;
  closed_command_id: string | null;
  clock_skew_ms: number;
  pending_review: boolean;
  review_reason: string | null;
  last_approved_adjustment_id: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    employmentId: row.employment_id,
    status: row.status as TimeEntry["status"],
    capturedAt: new Date(row.captured_at),
    ...(row.effective_captured_at !== null
      ? { effectiveCapturedAt: new Date(row.effective_captured_at) }
      : {}),
    receivedAt: new Date(row.received_at),
    timezone: row.timezone,
    source: row.source as TimeEntry["source"],
    deviceId: row.device_id,
    deviceSequence: row.device_sequence,
    ...(row.opened_command_id !== null ? { openedCommandId: row.opened_command_id } : {}),
    ...(row.closed_command_id !== null ? { closedCommandId: row.closed_command_id } : {}),
    clockSkewMs: row.clock_skew_ms,
    pendingReview: row.pending_review,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.shift_assignment_id !== null ? { shiftAssignmentId: row.shift_assignment_id } : {}),
    ...(row.closed_captured_at !== null ? { closedCapturedAt: new Date(row.closed_captured_at) } : {}),
    ...(row.effective_closed_captured_at !== null
      ? { effectiveClosedCapturedAt: new Date(row.effective_closed_captured_at) }
      : {}),
    ...(row.closed_received_at !== null ? { closedReceivedAt: new Date(row.closed_received_at) } : {}),
    ...(row.review_reason !== null ? { reviewReason: row.review_reason } : {}),
    ...(row.last_approved_adjustment_id !== null
      ? { lastApprovedAdjustmentId: row.last_approved_adjustment_id }
      : {}),
  };
}

function toRow(entry: TimeEntry): TimeEntryRow {
  return {
    id: entry.id,
    tenant_id: entry.tenantId,
    branch_id: entry.branchId,
    employment_id: entry.employmentId,
    shift_assignment_id: entry.shiftAssignmentId ?? null,
    status: entry.status,
    captured_at: entry.capturedAt.toISOString(),
    effective_captured_at: entry.effectiveCapturedAt ? entry.effectiveCapturedAt.toISOString() : null,
    received_at: entry.receivedAt.toISOString(),
    closed_captured_at: entry.closedCapturedAt ? entry.closedCapturedAt.toISOString() : null,
    effective_closed_captured_at: entry.effectiveClosedCapturedAt
      ? entry.effectiveClosedCapturedAt.toISOString()
      : null,
    closed_received_at: entry.closedReceivedAt ? entry.closedReceivedAt.toISOString() : null,
    timezone: entry.timezone,
    source: entry.source,
    device_id: entry.deviceId,
    device_sequence: entry.deviceSequence,
    opened_command_id: entry.openedCommandId ?? null,
    closed_command_id: entry.closedCommandId ?? null,
    clock_skew_ms: entry.clockSkewMs,
    pending_review: entry.pendingReview,
    review_reason: entry.reviewReason ?? null,
    last_approved_adjustment_id: entry.lastApprovedAdjustmentId ?? null,
    revision: entry.revision,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

export class SupabaseTimeEntryRepository implements TimeEntryRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<TimeEntry | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TimeEntryRow) : null;
  }

  async findOpenByEmployment(tenantId: string, employmentId: string): Promise<TimeEntry | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("employment_id", employmentId)
      .eq("status", "OPEN")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TimeEntryRow) : null;
  }

  async listByEmployment(tenantId: string, employmentId: string): Promise<TimeEntry[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("employment_id", employmentId);
    if (error) throw error;
    return (data as TimeEntryRow[]).map(fromRow);
  }

  async listByBranch(tenantId: string, branchId: string): Promise<TimeEntry[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as TimeEntryRow[]).map(fromRow);
  }

  async save(entry: TimeEntry): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(entry));
    if (error) throw error;
  }
}
