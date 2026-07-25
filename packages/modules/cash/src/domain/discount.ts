// SPEC-127 — Discount domain model (heavily simplified per approved scope).
//
// A Discount is a versioned reduction policy: FIXED (a currency amount in minor
// units) or PERCENTAGE (basis points, e.g. 1000 = 10.00%). Publishing freezes
// the policy: DRAFT -> PUBLISHED disallows further field edits (only
// deactivation remains).
//
// SCOPE NOTES (deferred, documented):
//   - `scope` is a free-form tag string, NOT a real eligibility-rule engine.
//   - No priority / stacking / caps / approvalThreshold engine: a single
//     discount applies at a time in this MVP. Stacking multiple discounts on one
//     Order/Check is NOT supported; there is no cap or approval-threshold logic.
//   - `validFrom`/`validUntil` are stored but not enforced against a clock at
//     apply time in this walking skeleton (timezone/vigencia evaluation
//     deferred).

export type DiscountType = "FIXED" | "PERCENTAGE";
export type DiscountStatus = "DRAFT" | "PUBLISHED" | "DEACTIVATED";

export interface Discount {
  id: string;
  tenantId: string;
  name: string;
  type: DiscountType;
  // FIXED: amount in minor units. PERCENTAGE: basis points (1000 = 10.00%).
  value: number;
  scope: string;
  validFrom?: Date | null;
  validUntil?: Date | null;
  status: DiscountStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<DiscountStatus, DiscountStatus[]> = {
  DRAFT: ["PUBLISHED", "DEACTIVATED"],
  PUBLISHED: ["DEACTIVATED"],
  DEACTIVATED: [],
};

export class InvalidDiscountTransitionError extends Error {
  constructor(from: DiscountStatus, to: DiscountStatus) {
    super(`Discount cannot transition from ${from} to ${to}`);
    this.name = "InvalidDiscountTransitionError";
  }
}

export function assertDiscountTransition(from: DiscountStatus, to: DiscountStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidDiscountTransitionError(from, to);
  }
}

export class InvalidDiscountValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDiscountValueError";
  }
}

export function assertValidDiscountValue(type: DiscountType, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InvalidDiscountValueError(`Discount value ${value} must be a positive integer`);
  }
  if (type === "PERCENTAGE" && value > 10000) {
    throw new InvalidDiscountValueError(
      `PERCENTAGE discount value ${value} basis points exceeds 100.00% (10000)`,
    );
  }
}

export class DiscountNotPublishedError extends Error {
  constructor(id: string, status: DiscountStatus) {
    super(`Discount ${id} is ${status}; only a PUBLISHED discount can be applied`);
    this.name = "DiscountNotPublishedError";
  }
}

// Pure computation of the applied amount for a discount against an eligible
// base (both in minor units). Never negative, never exceeds the eligible base
// (SPEC-127: "nunca produce base negativa"). PERCENTAGE rounds down (floor) —
// the only rounding step, under a single shared MoneyPolicy convention.
export function computeAppliedAmountMinorUnits(
  type: DiscountType,
  value: number,
  eligibleBaseMinorUnits: number,
): number {
  if (eligibleBaseMinorUnits <= 0) return 0;
  const raw =
    type === "FIXED"
      ? value
      : Math.floor((eligibleBaseMinorUnits * value) / 10000);
  return Math.max(0, Math.min(raw, eligibleBaseMinorUnits));
}
