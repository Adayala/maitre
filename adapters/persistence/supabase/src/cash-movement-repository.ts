import type { SupabaseClient } from "@supabase/supabase-js";
import type { CashMovement, CashMovementRepositoryPort } from "@maitre/cash";

const TABLE = "cash_movements";

interface CashMovementRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  cash_register_id: string;
  cash_session_id: string;
  currency: string;
  type: string;
  direction: string;
  amount_minor_units: number;
  source_type: string | null;
  source_reference: string | null;
  compensates_movement_id: string | null;
  idempotency_key: string | null;
  actor: string;
  reason: string | null;
  ledger_revision: number;
  occurred_at: string;
  recorded_at: string;
}

function fromRow(row: CashMovementRow): CashMovement {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    cashRegisterId: row.cash_register_id,
    cashSessionId: row.cash_session_id,
    currency: row.currency,
    type: row.type as CashMovement["type"],
    direction: row.direction as CashMovement["direction"],
    amountMinorUnits: row.amount_minor_units,
    sourceType: row.source_type,
    sourceReference: row.source_reference,
    compensatesMovementId: row.compensates_movement_id,
    idempotencyKey: row.idempotency_key,
    actor: row.actor,
    reason: row.reason,
    ledgerRevision: row.ledger_revision,
    occurredAt: new Date(row.occurred_at),
    recordedAt: new Date(row.recorded_at),
  };
}

function toRow(movement: CashMovement): CashMovementRow {
  return {
    id: movement.id,
    tenant_id: movement.tenantId,
    branch_id: movement.branchId,
    cash_register_id: movement.cashRegisterId,
    cash_session_id: movement.cashSessionId,
    currency: movement.currency,
    type: movement.type,
    direction: movement.direction,
    amount_minor_units: movement.amountMinorUnits,
    source_type: movement.sourceType ?? null,
    source_reference: movement.sourceReference ?? null,
    compensates_movement_id: movement.compensatesMovementId ?? null,
    idempotency_key: movement.idempotencyKey ?? null,
    actor: movement.actor,
    reason: movement.reason ?? null,
    ledger_revision: movement.ledgerRevision,
    occurred_at: movement.occurredAt.toISOString(),
    recorded_at: movement.recordedAt.toISOString(),
  };
}

export class SupabaseCashMovementRepository implements CashMovementRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CashMovement | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashMovementRow) : null;
  }

  async listBySession(tenantId: string, cashSessionId: string): Promise<CashMovement[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cash_session_id", cashSessionId)
      .order("ledger_revision", { ascending: true });
    if (error) throw error;
    return (data as CashMovementRow[]).map(fromRow);
  }

  async findByRegisterAndSourceReference(
    tenantId: string,
    cashRegisterId: string,
    sourceReference: string,
  ): Promise<CashMovement | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("cash_register_id", cashRegisterId)
      .eq("source_reference", sourceReference)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashMovementRow) : null;
  }

  async listByBranchAndSessions(tenantId: string, cashSessionIds: string[]): Promise<CashMovement[]> {
    if (cashSessionIds.length === 0) return [];
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .in("cash_session_id", cashSessionIds)
      .order("ledger_revision", { ascending: true });
    if (error) throw error;
    return (data as CashMovementRow[]).map(fromRow);
  }

  async save(movement: CashMovement): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(movement));
    if (error) throw error;
  }
}
