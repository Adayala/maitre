// SPEC-124 — CashSession domain model.
//
// CashSession is the authoritative aggregate per (register, currency) opening:
// business date/timezone, opening amount, cutoff, ledger revision and the
// lifecycle OPEN -> CLOSING -> CLOSED -> RECONCILED. `suspended` is an
// orthogonal operational flag, not a lifecycle state.
//
// ENFORCED INVARIANT (real): only one OPEN or CLOSING session may exist per
// (cashRegisterId, currency) at a time — enforced in session-commands.ts via a
// repository lookup before opening.
//
// SCOPE NOTES (deferred, documented):
//   - The opening float is stored on `openingAmountMinorUnits`; no auto-created
//     OPENING-type CashMovement is written (the reconciliation `expected`
//     formula adds the opening field explicitly, see cash-reconciliation.ts).
//   - CLOSED freezes the observed ledger and is immutable. A legitimate late
//     payment/refund arriving after cutoff is NOT specially handled in this MVP
//     (no LateAdjustment entity, no adjustment session) — it simply lands in the
//     NEXT session's ledger. Documented as a deferred SPEC-124/130 gap.
//   - `ledgerRevision` starts at 0 and is incremented on each accepted
//     CashMovement; close-session freezes it.

export type CashSessionStatus = "OPEN" | "CLOSING" | "CLOSED" | "RECONCILED";

export interface CashSession {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  currency: string;
  businessDate: string; // ISO date, e.g. "2026-07-25"
  timezone: string;
  openingAmountMinorUnits: number;
  openedAt: Date;
  openedBy: string;
  cutoffAt?: Date | null;
  closedAt?: Date | null;
  closedBy?: string | null;
  ledgerRevision: number;
  status: CashSessionStatus;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<CashSessionStatus, CashSessionStatus[]> = {
  OPEN: ["CLOSING"],
  CLOSING: ["CLOSED"],
  CLOSED: ["RECONCILED"],
  RECONCILED: [],
};

export class InvalidCashSessionTransitionError extends Error {
  constructor(from: CashSessionStatus, to: CashSessionStatus) {
    super(`CashSession cannot transition from ${from} to ${to}`);
    this.name = "InvalidCashSessionTransitionError";
  }
}

export function assertCashSessionTransition(from: CashSessionStatus, to: CashSessionStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidCashSessionTransitionError(from, to);
  }
}

export class SessionAlreadyOpenError extends Error {
  constructor(cashRegisterId: string, currency: string) {
    super(
      `An OPEN or CLOSING session already exists for register ${cashRegisterId} / ${currency}`,
    );
    this.name = "SessionAlreadyOpenError";
  }
}

export class InvalidCashSessionStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCashSessionStateError";
  }
}

// A session is "live" (blocks a second open for the same register+currency)
// while OPEN or CLOSING.
export function isSessionLive(session: CashSession): boolean {
  return session.status === "OPEN" || session.status === "CLOSING";
}
