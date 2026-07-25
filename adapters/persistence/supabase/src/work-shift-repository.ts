import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkShift, WorkShiftRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_work_shifts";

interface WorkShiftRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  timezone: string;
  business_date: string;
  starts_at_utc: string;
  ends_at_utc: string;
  labor_policy_version: string;
  service_period_id: string | null;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

function fromRow(row: WorkShiftRow): WorkShift {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    timezone: row.timezone,
    businessDate: row.business_date,
    startsAtUtc: new Date(row.starts_at_utc),
    endsAtUtc: new Date(row.ends_at_utc),
    laborPolicyVersion: row.labor_policy_version,
    status: row.status as WorkShift["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.service_period_id !== null ? { servicePeriodId: row.service_period_id } : {}),
    ...(row.published_at !== null ? { publishedAt: new Date(row.published_at) } : {}),
    ...(row.started_at !== null ? { startedAt: new Date(row.started_at) } : {}),
    ...(row.completed_at !== null ? { completedAt: new Date(row.completed_at) } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: new Date(row.cancelled_at) } : {}),
  };
}

function toRow(shift: WorkShift): WorkShiftRow {
  return {
    id: shift.id,
    tenant_id: shift.tenantId,
    branch_id: shift.branchId,
    timezone: shift.timezone,
    business_date: shift.businessDate,
    starts_at_utc: shift.startsAtUtc.toISOString(),
    ends_at_utc: shift.endsAtUtc.toISOString(),
    labor_policy_version: shift.laborPolicyVersion,
    service_period_id: shift.servicePeriodId ?? null,
    status: shift.status,
    revision: shift.revision,
    created_at: shift.createdAt.toISOString(),
    updated_at: shift.updatedAt.toISOString(),
    published_at: shift.publishedAt ? shift.publishedAt.toISOString() : null,
    started_at: shift.startedAt ? shift.startedAt.toISOString() : null,
    completed_at: shift.completedAt ? shift.completedAt.toISOString() : null,
    cancelled_at: shift.cancelledAt ? shift.cancelledAt.toISOString() : null,
  };
}

export class SupabaseWorkShiftRepository implements WorkShiftRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<WorkShift | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as WorkShiftRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<WorkShift[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as WorkShiftRow[]).map(fromRow);
  }

  async save(shift: WorkShift): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(shift));
    if (error) throw error;
  }
}
