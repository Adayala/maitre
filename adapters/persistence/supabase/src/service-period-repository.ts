import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServicePeriod, ServicePeriodRepositoryPort } from "@maitre/floor";

const TABLE = "floor_service_periods";

interface ServicePeriodRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  business_date: string;
  name: string;
  type: string;
  planned_open: string | null;
  planned_close: string | null;
  actual_open: string | null;
  actual_close: string | null;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ServicePeriodRow): ServicePeriod {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    businessDate: row.business_date,
    name: row.name,
    type: row.type as ServicePeriod["type"],
    status: row.status as ServicePeriod["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.planned_open !== null ? { plannedOpen: new Date(row.planned_open) } : {}),
    ...(row.planned_close !== null ? { plannedClose: new Date(row.planned_close) } : {}),
    ...(row.actual_open !== null ? { actualOpen: new Date(row.actual_open) } : {}),
    ...(row.actual_close !== null ? { actualClose: new Date(row.actual_close) } : {}),
  };
}

function toRow(period: ServicePeriod): ServicePeriodRow {
  return {
    id: period.id,
    tenant_id: period.tenantId,
    branch_id: period.branchId,
    business_date: period.businessDate,
    name: period.name,
    type: period.type,
    planned_open: period.plannedOpen ? period.plannedOpen.toISOString() : null,
    planned_close: period.plannedClose ? period.plannedClose.toISOString() : null,
    actual_open: period.actualOpen ? period.actualOpen.toISOString() : null,
    actual_close: period.actualClose ? period.actualClose.toISOString() : null,
    status: period.status,
    revision: period.revision,
    created_at: period.createdAt.toISOString(),
    updated_at: period.updatedAt.toISOString(),
  };
}

export class SupabaseServicePeriodRepository implements ServicePeriodRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<ServicePeriod | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ServicePeriodRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<ServicePeriod[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as ServicePeriodRow[]).map(fromRow);
  }

  async findActiveByBranch(tenantId: string, branchId: string): Promise<ServicePeriod | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .in("status", ["OPEN", "CLOSING"])
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ServicePeriodRow) : null;
  }

  async save(period: ServicePeriod): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(period));
    if (error) throw error;
  }
}
