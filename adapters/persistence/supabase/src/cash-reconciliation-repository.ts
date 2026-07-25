import type { SupabaseClient } from "@supabase/supabase-js";
import type { CashReconciliation, CashReconciliationRepositoryPort } from "@maitre/cash";

const TABLE = "cash_reconciliations";

interface CashReconciliationRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  cash_register_id: string;
  cash_session_id: string;
  currency: string;
  ledger_revision: number;
  attempt: number;
  counted_minor_units: number | null;
  expected_minor_units: number;
  difference_minor_units: number | null;
  status: string;
  prepared_by: string;
  prepared_at: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CashReconciliationRow): CashReconciliation {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    cashRegisterId: row.cash_register_id,
    cashSessionId: row.cash_session_id,
    currency: row.currency,
    ledgerRevision: row.ledger_revision,
    attempt: row.attempt,
    countedMinorUnits: row.counted_minor_units,
    expectedMinorUnits: row.expected_minor_units,
    differenceMinorUnits: row.difference_minor_units,
    status: row.status as CashReconciliation["status"],
    preparedBy: row.prepared_by,
    preparedAt: new Date(row.prepared_at),
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at ? new Date(row.approved_at) : null,
    rejectedBy: row.rejected_by,
    rejectedAt: row.rejected_at ? new Date(row.rejected_at) : null,
    rejectionReason: row.rejection_reason,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(rec: CashReconciliation): CashReconciliationRow {
  return {
    id: rec.id,
    tenant_id: rec.tenantId,
    branch_id: rec.branchId,
    cash_register_id: rec.cashRegisterId,
    cash_session_id: rec.cashSessionId,
    currency: rec.currency,
    ledger_revision: rec.ledgerRevision,
    attempt: rec.attempt,
    counted_minor_units: rec.countedMinorUnits,
    expected_minor_units: rec.expectedMinorUnits,
    difference_minor_units: rec.differenceMinorUnits ?? null,
    status: rec.status,
    prepared_by: rec.preparedBy,
    prepared_at: rec.preparedAt.toISOString(),
    submitted_at: rec.submittedAt ? rec.submittedAt.toISOString() : null,
    approved_by: rec.approvedBy ?? null,
    approved_at: rec.approvedAt ? rec.approvedAt.toISOString() : null,
    rejected_by: rec.rejectedBy ?? null,
    rejected_at: rec.rejectedAt ? rec.rejectedAt.toISOString() : null,
    rejection_reason: rec.rejectionReason ?? null,
    created_at: rec.createdAt.toISOString(),
    updated_at: rec.updatedAt.toISOString(),
  };
}

export class SupabaseCashReconciliationRepository implements CashReconciliationRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CashReconciliation | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashReconciliationRow) : null;
  }

  async findBySession(tenantId: string, cashSessionId: string): Promise<CashReconciliation | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cash_session_id", cashSessionId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashReconciliationRow) : null;
  }

  async save(rec: CashReconciliation): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(rec));
    if (error) throw error;
  }
}
