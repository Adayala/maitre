// Payment use cases (SPEC-059).
//
// SCOPE NOTE: capture/refund are synchronous — no provider webhook flow,
// no PENDING_RECONCILIATION. create-intent + authorize + capture are
// collapsed: createPayment starts PENDING, capturePayment moves directly
// to CAPTURED (skipping a separate AUTHORIZED step for the common case;
// AUTHORIZED remains a valid transition for callers that want it, see
// domain/payment.ts, but no route drives it in this MVP — documented gap).

import { randomUUID } from "node:crypto";
import {
  type Payment,
  assertPaymentTransition,
  PaymentExceedsBalanceError,
  netCaptured,
} from "../domain/payment.js";
import { computeCheckTotals, assertValidAmount } from "../domain/check.js";
import type { CheckRepositoryPort, PaymentRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { paymentCapturedEvent, paymentFailedEvent, paymentVoidedEvent, refundSucceededEvent } from "./events.js";

export interface PaymentDeps {
  payments: PaymentRepositoryPort;
  checks: CheckRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export interface CreatePaymentInput {
  tenantId: string;
  branchId: string;
  checkId: string;
  amountMinorUnits: number;
  currency: string;
  tipMinorUnits?: number;
  method: Payment["method"];
  idempotencyKey: string;
}

// POST /v1/checks/:id/payments — create-intent. Idempotency-Key is
// mandatory: a retry with the same key returns the prior Payment.
export async function createPayment(deps: PaymentDeps, input: CreatePaymentInput): Promise<Payment> {
  const existing = await deps.payments.findByIdempotencyKey(input.tenantId, input.idempotencyKey);
  if (existing) return existing;

  assertValidAmount(input.amountMinorUnits);
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);

  const now = (deps.now ?? (() => new Date()))();
  const payment: Payment = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    checkId: input.checkId,
    amountMinorUnits: input.amountMinorUnits,
    currency: input.currency,
    method: input.method,
    status: "PENDING",
    idempotencyKey: input.idempotencyKey,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.tipMinorUnits !== undefined ? { tipMinorUnits: input.tipMinorUnits } : {}),
  };
  await deps.payments.save(payment);
  return payment;
}

export interface CapturePaymentInput {
  tenantId: string;
  paymentId: string;
  correlationId?: string;
}

// POST /v1/payments/:id/capture — enforces total captured (net of
// refunds) does not exceed check balance + tip.
// Cash ledger integration belongs to the API composition root so this module
// remains independent from Cash. The orchestrator records exactly one
// CashMovement using the Payment id as source reference.
export async function capturePayment(deps: PaymentDeps, input: CapturePaymentInput): Promise<Payment> {
  const payment = await deps.payments.findById(input.tenantId, input.paymentId);
  if (!payment) throw new Error(`Payment ${input.paymentId} not found`);
  assertPaymentTransition(payment.status, "CAPTURED");

  const check = await deps.checks.findById(input.tenantId, payment.checkId);
  if (!check) throw new Error(`Check ${payment.checkId} not found`);

  const otherPayments = await deps.payments.listByCheck(input.tenantId, payment.checkId);
  const alreadyPaid = otherPayments
    .filter((p) => p.id !== payment.id)
    .reduce((sum, p) => sum + netCaptured(p), 0);
  const totals = computeCheckTotals(check, alreadyPaid);
  const available = totals.balance + (payment.tipMinorUnits ?? 0);
  if (payment.amountMinorUnits > available) {
    throw new PaymentExceedsBalanceError(payment.amountMinorUnits, available);
  }

  const now = (deps.now ?? (() => new Date()))();
  const updated: Payment = { ...payment, status: "CAPTURED", revision: payment.revision + 1, updatedAt: now };
  await deps.payments.save(updated);
  await deps.outbox.append(paymentCapturedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface FailPaymentInput {
  tenantId: string;
  paymentId: string;
  correlationId?: string;
}

export async function failPayment(deps: PaymentDeps, input: FailPaymentInput): Promise<Payment> {
  const payment = await deps.payments.findById(input.tenantId, input.paymentId);
  if (!payment) throw new Error(`Payment ${input.paymentId} not found`);
  assertPaymentTransition(payment.status, "FAILED");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Payment = { ...payment, status: "FAILED", revision: payment.revision + 1, updatedAt: now };
  await deps.payments.save(updated);
  await deps.outbox.append(paymentFailedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface VoidPaymentInput {
  tenantId: string;
  paymentId: string;
  correlationId?: string;
}

// POST /v1/payments/:id/void — pre-refund reversal of a non-refunded Payment.
export async function voidPayment(deps: PaymentDeps, input: VoidPaymentInput): Promise<Payment> {
  const payment = await deps.payments.findById(input.tenantId, input.paymentId);
  if (!payment) throw new Error(`Payment ${input.paymentId} not found`);
  assertPaymentTransition(payment.status, "VOID");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Payment = { ...payment, status: "VOID", revision: payment.revision + 1, updatedAt: now };
  await deps.payments.save(updated);
  await deps.outbox.append(paymentVoidedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface RefundPaymentInput {
  tenantId: string;
  paymentId: string;
  amountMinorUnits: number;
  correlationId?: string;
}

// POST /v1/payments/:id/refund — single optional refund sub-record, partial
// amount allowed but no separate ledger (see domain/payment.ts scope note).
export async function refundPayment(deps: PaymentDeps, input: RefundPaymentInput): Promise<Payment> {
  const payment = await deps.payments.findById(input.tenantId, input.paymentId);
  if (!payment) throw new Error(`Payment ${input.paymentId} not found`);
  if (payment.status !== "CAPTURED") throw new Error(`Payment ${payment.id} is not CAPTURED`);
  assertValidAmount(input.amountMinorUnits);
  if (input.amountMinorUnits > payment.amountMinorUnits) {
    throw new Error(`Refund ${input.amountMinorUnits} exceeds captured amount ${payment.amountMinorUnits}`);
  }

  const now = (deps.now ?? (() => new Date()))();
  const updated: Payment = {
    ...payment,
    refund: { amountMinorUnits: input.amountMinorUnits, status: "SUCCEEDED" },
    revision: payment.revision + 1,
    updatedAt: now,
  };
  await deps.payments.save(updated);
  await deps.outbox.append(refundSucceededEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}
