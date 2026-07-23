// SPEC-052 — Check domain model.
//
// SCOPE NOTE (approved simplification): lines are free-form
// {description, amountMinorUnits} — no OrderItem snapshot linkage since
// the Ordering domain doesn't exist yet. estimatedTax is always 0: no
// TaxPolicy/tax engine exists yet, so we don't fabricate a rate. Split
// checks are explicitly out of scope per spec ("no se simula" in MVP).
// One Check per Visit is enforced by the use case layer, not here.

export type CheckStatus = "OPEN" | "PAYMENT_PENDING" | "SETTLED" | "VOID";

export interface CheckLine {
  id: string;
  description: string;
  amountMinorUnits: number;
}

export interface CheckAdjustment {
  id: string;
  description: string;
  amountMinorUnits: number;
  reason: string;
}

export interface Check {
  id: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  currency: string;
  lines: CheckLine[];
  adjustments: CheckAdjustment[];
  status: CheckStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckTotals {
  gross: number;
  discounts: number;
  estimatedTax: number;
  serviceCharges: number;
  netDue: number;
  paid: number;
  balance: number;
}

export class InvalidAmountError extends Error {
  constructor(amountMinorUnits: number) {
    super(`Amount ${amountMinorUnits} must be a non-negative integer (minor units)`);
    this.name = "InvalidAmountError";
  }
}

export function assertValidAmount(amountMinorUnits: number): void {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits < 0) {
    throw new InvalidAmountError(amountMinorUnits);
  }
}

/**
 * gross = sum(lines); adjustments negative reduce netDue (discounts),
 * positive increase it (serviceCharges) — kept as a single adjustments
 * array per the simplified model rather than separate discount/service
 * collections. estimatedTax is always 0 (deferred — no TaxPolicy yet).
 * paid comes from the Payment repository (captures - refunds), passed in
 * by the caller since Check itself doesn't reference Payments.
 */
export function computeCheckTotals(check: Check, paidMinorUnits: number): CheckTotals {
  const gross = check.lines.reduce((sum, l) => sum + l.amountMinorUnits, 0);
  const discounts = check.adjustments
    .filter((a) => a.amountMinorUnits < 0)
    .reduce((sum, a) => sum + Math.abs(a.amountMinorUnits), 0);
  const serviceCharges = check.adjustments
    .filter((a) => a.amountMinorUnits > 0)
    .reduce((sum, a) => sum + a.amountMinorUnits, 0);
  const estimatedTax = 0;
  const netDue = gross - discounts + estimatedTax + serviceCharges;
  const balance = netDue - paidMinorUnits;
  return { gross, discounts, estimatedTax, serviceCharges, netDue, paid: paidMinorUnits, balance };
}

const allowedTransitions: Record<CheckStatus, CheckStatus[]> = {
  OPEN: ["PAYMENT_PENDING", "VOID"],
  PAYMENT_PENDING: ["OPEN", "SETTLED", "VOID"],
  SETTLED: [],
  VOID: [],
};

export class InvalidCheckTransitionError extends Error {
  constructor(from: CheckStatus, to: CheckStatus) {
    super(`Check cannot transition from ${from} to ${to}`);
    this.name = "InvalidCheckTransitionError";
  }
}

export function assertCheckTransition(from: CheckStatus, to: CheckStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidCheckTransitionError(from, to);
  }
}

export class CheckNotBalancedError extends Error {
  constructor(balance: number) {
    super(`Check balance is ${balance}, must be 0 to settle`);
    this.name = "CheckNotBalancedError";
  }
}
