import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimeExportJobRecord, TimeExportJobRepositoryPort } from "./time-export-repository.js";

const TABLE = "workforce_time_export_jobs";

interface TimeExportJobRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  status: "REQUESTED";
  format: "CSV";
  from_at: string;
  to_at: string;
  reason: string;
  requested_at: string;
  step_up_at: string;
  requested_by_user_id: string;
  manifest: TimeExportJobRecord["manifest"];
}

function fromRow(row: TimeExportJobRow): TimeExportJobRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    status: row.status,
    format: row.format,
    from: new Date(row.from_at),
    to: new Date(row.to_at),
    reason: row.reason,
    requestedAt: new Date(row.requested_at),
    stepUpAt: new Date(row.step_up_at),
    requestedByUserId: row.requested_by_user_id,
    manifest: row.manifest,
  };
}

function toRow(job: TimeExportJobRecord): TimeExportJobRow {
  return {
    id: job.id,
    tenant_id: job.tenantId,
    branch_id: job.branchId,
    status: job.status,
    format: job.format,
    from_at: job.from.toISOString(),
    to_at: job.to.toISOString(),
    reason: job.reason,
    requested_at: job.requestedAt.toISOString(),
    step_up_at: job.stepUpAt.toISOString(),
    requested_by_user_id: job.requestedByUserId,
    manifest: job.manifest,
  };
}

export class SupabaseTimeExportJobRepository implements TimeExportJobRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<TimeExportJobRecord | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TimeExportJobRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<TimeExportJobRecord[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("requested_at", { ascending: false });
    if (error) throw error;
    return ((data as TimeExportJobRow[]) ?? []).map(fromRow);
  }

  async save(job: TimeExportJobRecord): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(job));
    if (error) throw error;
  }
}
