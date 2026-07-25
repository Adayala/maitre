import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShiftAssignment, ShiftAssignmentRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_shift_assignments";

interface ShiftAssignmentRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  work_shift_id: string;
  employment_id: string;
  role_code: string;
  station_id: string | null;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  declined_at: string | null;
  cancelled_at: string | null;
}

function fromRow(row: ShiftAssignmentRow): ShiftAssignment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    workShiftId: row.work_shift_id,
    employmentId: row.employment_id,
    roleCode: row.role_code,
    status: row.status as ShiftAssignment["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.station_id !== null ? { stationId: row.station_id } : {}),
    ...(row.confirmed_at !== null ? { confirmedAt: new Date(row.confirmed_at) } : {}),
    ...(row.declined_at !== null ? { declinedAt: new Date(row.declined_at) } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: new Date(row.cancelled_at) } : {}),
  };
}

function toRow(assignment: ShiftAssignment): ShiftAssignmentRow {
  return {
    id: assignment.id,
    tenant_id: assignment.tenantId,
    branch_id: assignment.branchId,
    work_shift_id: assignment.workShiftId,
    employment_id: assignment.employmentId,
    role_code: assignment.roleCode,
    station_id: assignment.stationId ?? null,
    status: assignment.status,
    revision: assignment.revision,
    created_at: assignment.createdAt.toISOString(),
    updated_at: assignment.updatedAt.toISOString(),
    confirmed_at: assignment.confirmedAt ? assignment.confirmedAt.toISOString() : null,
    declined_at: assignment.declinedAt ? assignment.declinedAt.toISOString() : null,
    cancelled_at: assignment.cancelledAt ? assignment.cancelledAt.toISOString() : null,
  };
}

export class SupabaseShiftAssignmentRepository implements ShiftAssignmentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<ShiftAssignment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ShiftAssignmentRow) : null;
  }

  async findByShiftAndEmployment(
    tenantId: string,
    workShiftId: string,
    employmentId: string,
  ): Promise<ShiftAssignment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("work_shift_id", workShiftId)
      .eq("employment_id", employmentId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ShiftAssignmentRow) : null;
  }

  async listByShift(tenantId: string, workShiftId: string): Promise<ShiftAssignment[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("work_shift_id", workShiftId);
    if (error) throw error;
    return (data as ShiftAssignmentRow[]).map(fromRow);
  }

  async save(assignment: ShiftAssignment): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(assignment));
    if (error) throw error;
  }
}
