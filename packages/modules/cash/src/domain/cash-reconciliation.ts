// SPEC-126 — CashReconciliation domain model.
//
// Compares the server-computed `expected` cash against the operator-declared
// `counted` cash for a CLOSED CashSession. `expected` is ALWAYS derived from
// the session's frozen ledger — the client only ever supplies `counted`
// (SPEC-126: "el cliente sólo informa conteos").
//
//   expected   = opening + Σ(IN movements) − Σ(OUT movements)   (CLOSING_COUNT excluded)
//   difference = counted − expected
//
// Lifecycle: DRAFT -> SUBMITTED -> APPROVED | REJECTED.
//
// SCOPE NOTES (deferred, documented):
//   - REJECTED allows a fresh attempt: rather than the full SPEC-126 "resubmit
//     creates a new revision chain" versioning, we track a simple `attempt`
//     counter and let a rejected reconciliation be re-driven (record counts ->
//     submit) again. Historical intents are not destructively edited.
//   - Segregation of duties (approver != preparer) is NOT hard-enforced — the
//     route's `cash.reconciliation.approve` permission is the only gate
//     (deferred per approved scope).
//   - A late payment/refund after cutoff never mutates an APPROVED
//     reconciliation (no LateAdjustment mechanism — see cash-session.ts).
//   - `evidenceRefs`/denomination breakdowns are not modelled (counted is a
//     single total, deferred).

import type { CashMovement } from "./cash-movement.js";
import { sumLedger } from "./cash-movement.js";

export type CashReconciliationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface CashReconciliation {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  cashSessionId: string;
  currency: string;
  ledgerRevision: number;
  attempt: number;
  countedMinorUnits: number | null;
  expectedMinorUnits: number;
  differenceMinorUnits: number | null;
  status: CashReconciliationStatus;
  preparedBy: string;
  preparedAt: Date;
  submittedAt?: Date | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// SPEC-126 expected equation — the single source of truth, reused by
// reconciliation-commands.ts and the daily settlement calculation.
export function computeExpectedMinorUnits(
  openingAmountMinorUnits: number,
  movements: readonly CashMovement[],
): number {
  return openingAmountMinorUnits + sumLedger(movements);
}

export function computeDifferenceMinorUnits(
  countedMinorUnits: number,
  expectedMinorUnits: number,
): number {
  return countedMinorUnits - expectedMinorUnits;
}

const allowedTransitions: Record<CashReconciliationStatus, CashReconciliationStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: [],
  // A rejected reconciliation can be re-driven back to DRAFT for a new attempt.
  REJECTED: ["DRAFT"],
};

export class InvalidReconciliationTransitionError extends Error {
  constructor(from: CashReconciliationStatus, to: CashReconciliationStatus) {
    super(`CashReconciliation cannot transition from ${from} to ${to}`);
    this.name = "InvalidReconciliationTransitionError";
  }
}

export function assertReconciliationTransition(
  from: CashReconciliationStatus,
  to: CashReconciliationStatus,
): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidReconciliationTransitionError(from, to);
  }
}

export class InvalidReconciliationStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReconciliationStateError";
  }
}
