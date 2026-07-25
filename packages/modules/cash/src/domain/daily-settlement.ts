// SPEC-134 — DailySettlement, a pure stateless calculation function.
//
// Aggregates a day's cash activity for one (tenant, branch, businessDate,
// currency): per session it applies the SPEC-126 reconciliation equation, and
// for the day it sums openings, movement totals by type, expected/counted and
// differences. It is NOT a stored entity — it is computed on demand and served
// via a GET endpoint.
//
// SCOPE NOTES (deferred, documented):
//   - Cross-domain completeness: this settlement reconciles ONLY Cash's own
//     ledger. It does NOT cross-check source identities against Floor Payment
//     records to detect missing or duplicated cash captures (SPEC-134's
//     Payment reconciliation is deferred).
//   - No versioning / input-hash / "recalculation produces a new version"
//     tracking — every call recomputes from the passed-in sessions/movements.
//   - Currencies are never netted: the caller passes a single currency's
//     sessions/movements. Mixing business dates is the caller's responsibility.

import type { CashSession } from "./cash-session.js";
import type { CashMovement, CashMovementType } from "./cash-movement.js";
import { ledgerContribution } from "./cash-movement.js";
import { computeExpectedMinorUnits } from "./cash-reconciliation.js";

export interface DailySettlementSessionLine {
  cashSessionId: string;
  cashRegisterId: string;
  status: CashSession["status"];
  openingMinorUnits: number;
  expectedMinorUnits: number;
  countedMinorUnits: number | null;
  differenceMinorUnits: number | null;
}

export interface DailySettlement {
  tenantId: string;
  branchId: string;
  businessDate: string;
  timezone: string;
  currency: string;
  sessionCount: number;
  openingsMinorUnits: number;
  movementsByType: Record<string, number>; // signed net contribution per type
  expectedMinorUnits: number;
  countedMinorUnits: number; // sum of counted sessions (uncounted contribute 0)
  differenceMinorUnits: number; // countedMinorUnits − expectedMinorUnits over counted sessions
  sessions: DailySettlementSessionLine[];
}

export interface DailySettlementReconciliationInput {
  cashSessionId: string;
  countedMinorUnits: number | null;
}

// A pure function: given the day's sessions and movements (already filtered to
// the target tenant/branch/businessDate/currency by the caller) plus any
// reconciliation counts, produces the aggregated settlement.
export function calculateDailySettlement(input: {
  tenantId: string;
  branchId: string;
  businessDate: string;
  timezone: string;
  currency: string;
  sessions: readonly CashSession[];
  movements: readonly CashMovement[];
  reconciliations?: readonly DailySettlementReconciliationInput[];
}): DailySettlement {
  const countsBySession = new Map<string, number | null>();
  for (const r of input.reconciliations ?? []) {
    countsBySession.set(r.cashSessionId, r.countedMinorUnits);
  }

  const movementsByType: Record<string, number> = {};
  for (const m of input.movements) {
    movementsByType[m.type] = (movementsByType[m.type] ?? 0) + ledgerContribution(m);
  }

  let openingsMinorUnits = 0;
  let expectedMinorUnits = 0;
  let countedMinorUnits = 0;
  let differenceMinorUnits = 0;
  const sessionLines: DailySettlementSessionLine[] = [];

  for (const session of input.sessions) {
    const sessionMovements = input.movements.filter((m) => m.cashSessionId === session.id);
    const expected = computeExpectedMinorUnits(session.openingAmountMinorUnits, sessionMovements);
    const counted = countsBySession.has(session.id) ? countsBySession.get(session.id)! : null;
    const difference = counted === null ? null : counted - expected;

    openingsMinorUnits += session.openingAmountMinorUnits;
    expectedMinorUnits += expected;
    if (counted !== null) {
      countedMinorUnits += counted;
      differenceMinorUnits += counted - expected;
    }

    sessionLines.push({
      cashSessionId: session.id,
      cashRegisterId: session.cashRegisterId,
      status: session.status,
      openingMinorUnits: session.openingAmountMinorUnits,
      expectedMinorUnits: expected,
      countedMinorUnits: counted,
      differenceMinorUnits: difference,
    });
  }

  return {
    tenantId: input.tenantId,
    branchId: input.branchId,
    businessDate: input.businessDate,
    timezone: input.timezone,
    currency: input.currency,
    sessionCount: input.sessions.length,
    openingsMinorUnits,
    movementsByType,
    expectedMinorUnits,
    countedMinorUnits,
    differenceMinorUnits,
    sessions: sessionLines,
  };
}

// Re-export for callers building type-safe movementsByType keys.
export type { CashMovementType };
