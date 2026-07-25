// SPEC-125 — CashMovement domain model.
//
// A CashMovement is an IMMUTABLE journal entry against a CashSession. There is
// no update and no delete: corrections are expressed as new compensating
// entries linked via `compensatesMovementId` (never a mutation of the
// original). The economic sign lives in `direction` (IN|OUT), never in a
// negative amount — `amountMinorUnits` is always a positive integer.
//
// Type -> direction mapping (SPEC-125):
//   OPENING       -> IN   (informational; opening float normally lives on the
//                          session field, so OPENING movements are rare here)
//   CASH_SALE     -> IN
//   TIP_IN        -> IN
//   CASH_REFUND   -> OUT
//   DEPOSIT       -> OUT
//   WITHDRAWAL    -> OUT
//   TIP_OUT       -> OUT
//   ADJUSTMENT    -> either (caller supplies an explicit direction)
//   CLOSING_COUNT -> informational only; contributes 0 to the ledger balance
//
// SCOPE NOTES (deferred, documented):
//   - `sourceReference` dedup is a simple "reject if already used for this
//     register" check (see movement-commands.ts). No LimitsPolicy / risk-tier
//     engine — high-risk manual types are accepted as long as the session and
//     currency match (SPEC-129's fail-closed LimitsPolicy behaviour deferred).
//   - Cross-module wiring is manual: a cash Payment captured in Floor does NOT
//     automatically create a CASH_SALE here. A cashier records it by hand,
//     passing the Payment id as `sourceReference`. Documented deferred integration.

export type CashMovementDirection = "IN" | "OUT";

export type CashMovementType =
  | "OPENING"
  | "CASH_SALE"
  | "CASH_REFUND"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TIP_IN"
  | "TIP_OUT"
  | "ADJUSTMENT"
  | "CLOSING_COUNT";

export interface CashMovement {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  cashSessionId: string;
  currency: string;
  type: CashMovementType;
  direction: CashMovementDirection;
  amountMinorUnits: number;
  sourceType?: string | null;
  sourceReference?: string | null;
  compensatesMovementId?: string | null;
  idempotencyKey?: string | null;
  actor: string;
  reason?: string | null;
  ledgerRevision: number; // the session ledgerRevision this movement produced
  occurredAt: Date;
  recordedAt: Date;
}

// Fixed direction per type; ADJUSTMENT has no fixed direction (returns null).
const FIXED_DIRECTION: Record<CashMovementType, CashMovementDirection | null> = {
  OPENING: "IN",
  CASH_SALE: "IN",
  TIP_IN: "IN",
  CASH_REFUND: "OUT",
  DEPOSIT: "OUT",
  WITHDRAWAL: "OUT",
  TIP_OUT: "OUT",
  CLOSING_COUNT: "IN", // informational; never contributes to the balance (see ledgerContribution)
  ADJUSTMENT: null,
};

export class InvalidMovementDirectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMovementDirectionError";
  }
}

export class InvalidMovementAmountError extends Error {
  constructor(amountMinorUnits: number) {
    super(`Movement amount ${amountMinorUnits} must be a positive integer (minor units)`);
    this.name = "InvalidMovementAmountError";
  }
}

export function assertValidMovementAmount(amountMinorUnits: number): void {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    throw new InvalidMovementAmountError(amountMinorUnits);
  }
}

// Resolves the direction for a movement type. ADJUSTMENT requires an explicit
// direction; every other type ignores any explicit direction and uses its fixed
// one.
export function directionForType(
  type: CashMovementType,
  explicitDirection?: CashMovementDirection,
): CashMovementDirection {
  const fixed = FIXED_DIRECTION[type];
  if (type === "ADJUSTMENT") {
    if (!explicitDirection) {
      throw new InvalidMovementDirectionError("ADJUSTMENT movements require an explicit direction (IN|OUT)");
    }
    return explicitDirection;
  }
  return fixed as CashMovementDirection;
}

// The signed contribution of a movement to the session's cash balance.
// CLOSING_COUNT is informational and contributes 0. IN adds, OUT subtracts.
export function ledgerContribution(movement: Pick<CashMovement, "type" | "direction" | "amountMinorUnits">): number {
  if (movement.type === "CLOSING_COUNT") return 0;
  return movement.direction === "IN" ? movement.amountMinorUnits : -movement.amountMinorUnits;
}

// Sum of all non-informational movement contributions (excludes CLOSING_COUNT).
export function sumLedger(movements: readonly CashMovement[]): number {
  return movements.reduce((acc, m) => acc + ledgerContribution(m), 0);
}
