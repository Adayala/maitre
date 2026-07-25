import type { SupabaseClient } from "@supabase/supabase-js";
import type { CashSession, CashSessionRepositoryPort } from "@maitre/cash";

const TABLE = "cash_sessions";

interface CashSessionRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  cash_register_id: string;
  currency: string;
  business_date: string;
  timezone: string;
  opening_amount_minor_units: number;
  opened_at: string;
  opened_by: string;
  cutoff_at: string | null;
  closed_at: string | null;
  closed_by: string | null;
  ledger_revision: number;
  status: string;
  suspended: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CashSessionRow): CashSession {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    cashRegisterId: row.cash_register_id,
    currency: row.currency,
    businessDate: row.business_date,
    timezone: row.timezone,
    openingAmountMinorUnits: row.opening_amount_minor_units,
    openedAt: new Date(row.opened_at),
    openedBy: row.opened_by,
    cutoffAt: row.cutoff_at ? new Date(row.cutoff_at) : null,
    closedAt: row.closed_at ? new Date(row.closed_at) : null,
    closedBy: row.closed_by,
    ledgerRevision: row.ledger_revision,
    status: row.status as CashSession["status"],
    suspended: row.suspended,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(session: CashSession): CashSessionRow {
  return {
    id: session.id,
    tenant_id: session.tenantId,
    branch_id: session.branchId,
    cash_register_id: session.cashRegisterId,
    currency: session.currency,
    business_date: session.businessDate,
    timezone: session.timezone,
    opening_amount_minor_units: session.openingAmountMinorUnits,
    opened_at: session.openedAt.toISOString(),
    opened_by: session.openedBy,
    cutoff_at: session.cutoffAt ? session.cutoffAt.toISOString() : null,
    closed_at: session.closedAt ? session.closedAt.toISOString() : null,
    closed_by: session.closedBy ?? null,
    ledger_revision: session.ledgerRevision,
    status: session.status,
    suspended: session.suspended,
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString(),
  };
}

export class SupabaseCashSessionRepository implements CashSessionRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CashSession | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashSessionRow) : null;
  }

  async findLiveByRegisterAndCurrency(
    tenantId: string,
    cashRegisterId: string,
    currency: string,
  ): Promise<CashSession | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cash_register_id", cashRegisterId)
      .eq("currency", currency)
      .in("status", ["OPEN", "CLOSING"])
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashSessionRow) : null;
  }

  async listByRegister(tenantId: string, cashRegisterId: string): Promise<CashSession[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cash_register_id", cashRegisterId)
      .order("opened_at", { ascending: false });
    if (error) throw error;
    return (data as CashSessionRow[]).map(fromRow);
  }

  async listByBranchAndBusinessDate(
    tenantId: string,
    branchId: string,
    businessDate: string,
    currency: string,
  ): Promise<CashSession[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .eq("business_date", businessDate)
      .eq("currency", currency)
      .order("opened_at", { ascending: true });
    if (error) throw error;
    return (data as CashSessionRow[]).map(fromRow);
  }

  async save(session: CashSession): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(session));
    if (error) throw error;
  }
}
