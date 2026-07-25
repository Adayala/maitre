import type { SupabaseClient } from "@supabase/supabase-js";
import type { Employment, EmploymentRepositoryPort } from "@maitre/workforce";

const TABLE = "workforce_employments";

interface EmploymentRow {
  id: string;
  tenant_id: string;
  person_ref: string;
  employee_code: string;
  relationship_type: string;
  eligible_branch_ids: string[];
  status: string;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: EmploymentRow): Employment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    personRef: row.person_ref,
    employeeCode: row.employee_code,
    relationshipType: row.relationship_type as Employment["relationshipType"],
    eligibleBranchIds: row.eligible_branch_ids,
    status: row.status as Employment["status"],
    validFrom: new Date(row.valid_from),
    ...(row.valid_until !== null ? { validUntil: new Date(row.valid_until) } : {}),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(employment: Employment): EmploymentRow {
  return {
    id: employment.id,
    tenant_id: employment.tenantId,
    person_ref: employment.personRef,
    employee_code: employment.employeeCode,
    relationship_type: employment.relationshipType,
    eligible_branch_ids: employment.eligibleBranchIds,
    status: employment.status,
    valid_from: employment.validFrom.toISOString(),
    valid_until: employment.validUntil ? employment.validUntil.toISOString() : null,
    created_at: employment.createdAt.toISOString(),
    updated_at: employment.updatedAt.toISOString(),
  };
}

export class SupabaseEmploymentRepository implements EmploymentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Employment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as EmploymentRow) : null;
  }

  async findByEmployeeCode(tenantId: string, employeeCode: string): Promise<Employment | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("employee_code", employeeCode)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as EmploymentRow) : null;
  }

  async listByTenant(tenantId: string): Promise<Employment[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId);
    if (error) throw error;
    return (data as EmploymentRow[]).map(fromRow);
  }

  async save(employment: Employment): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(employment));
    if (error) throw error;
  }
}
