// SPEC-053 — Payment domain model.
//
// SCOPE NOTE (approved simplification): capture/refund are synchronous —
// no async provider callback flow, no PENDING_RECONCILIATION status, no
// provider webhook dedup. Refund is a single optional sub-record
// {amountMinorUnits, status}, not a separate ledger entity with partial
// multi-refund reconciliation. The API composition root records exactly one
// CashMovement for each CASH payment after capture.

export type PaymentMethod = "CASH" | "CARD" | "OTHER";
export type PaymentStatus = "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "VOID";
export type RefundStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export interface PaymentRefund {
  amountMinorUnits: number;
  status: RefundStatus;
}

export interface Payment {
  id: string;
  tenantId: string;
  branchId: string;
  checkId: string;
  amountMinorUnits: number;
  currency: string;
  tipMinorUnits?: number;
  method: PaymentMethod;
  status: PaymentStatus;
  refund?: PaymentRefund;
  idempotencyKey: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["AUTHORIZED", "CAPTURED", "FAILED", "VOID"],
  AUTHORIZED: ["CAPTURED", "FAILED", "VOID"],
  CAPTURED: ["VOID"], // VOID here models a full pre-refund reversal; refund models post-capture reversal
  FAILED: [],
  VOID: [],
};

export class InvalidPaymentTransitionError extends Error {
  constructor(from: PaymentStatus, to: PaymentStatus) {
    super(`Payment cannot transition from ${from} to ${to}`);
    this.name = "InvalidPaymentTransitionError";
  }
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidPaymentTransitionError(from, to);
  }
}

export class PaymentExceedsBalanceError extends Error {
  constructor(amountMinorUnits: number, availableMinorUnits: number) {
    super(
      `Payment amount ${amountMinorUnits} exceeds available balance + tip ${availableMinorUnits}`,
    );
    this.name = "PaymentExceedsBalanceError";
  }
}

export function netCaptured(payment: Payment): number {
  if (payment.status !== "CAPTURED") return 0;
  const refunded =
    payment.refund && payment.refund.status === "SUCCEEDED" ? payment.refund.amountMinorUnits : 0;
  return payment.amountMinorUnits - refunded;
}
