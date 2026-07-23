// Check use cases (SPEC-058).

import { randomUUID } from "node:crypto";
import {
  type Check,
  type CheckLine,
  type CheckAdjustment,
  assertCheckTransition,
  assertValidAmount,
  computeCheckTotals,
  CheckNotBalancedError,
} from "../domain/check.js";
import { netCaptured } from "../domain/payment.js";
import type { CheckRepositoryPort, PaymentRepositoryPort, VisitRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { checkGeneratedEvent, checkSettledEvent } from "./events.js";

export interface CheckDeps {
  checks: CheckRepositoryPort;
  visits: VisitRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export class DuplicateCheckError extends Error {
  constructor(visitId: string) {
    super(`Visit ${visitId} already has a Check (one Check per Visit)`);
    this.name = "DuplicateCheckError";
  }
}

export interface CreateCheckInput {
  tenantId: string;
  visitId: string;
  currency: string;
  correlationId?: string;
}

// POST /v1/visits/:id/check — one Check per Visit, enforced here.
export async function createCheck(deps: CheckDeps, input: CreateCheckInput): Promise<Check> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);

  const existing = await deps.checks.findByVisit(input.tenantId, input.visitId);
  if (existing) throw new DuplicateCheckError(input.visitId);

  const now = (deps.now ?? (() => new Date()))();
  const check: Check = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: visit.branchId,
    visitId: input.visitId,
    currency: input.currency,
    lines: [],
    adjustments: [],
    status: "OPEN",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.checks.save(check);
  await deps.outbox.append(checkGeneratedEvent(check, input.correlationId ?? randomUUID()));
  return check;
}

export interface AddCheckLineInput {
  tenantId: string;
  checkId: string;
  description: string;
  amountMinorUnits: number;
}

// Simplified addition endpoint — free-form lines (no OrderItem snapshot
// linkage yet, see check.ts scope note).
export async function addCheckLine(deps: { checks: CheckRepositoryPort; now?: () => Date }, input: AddCheckLineInput): Promise<Check> {
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);
  if (check.status !== "OPEN") throw new Error(`Check ${check.id} is not OPEN`);
  assertValidAmount(input.amountMinorUnits);

  const line: CheckLine = { id: randomUUID(), description: input.description, amountMinorUnits: input.amountMinorUnits };
  const now = (deps.now ?? (() => new Date()))();
  const updated: Check = { ...check, lines: [...check.lines, line], revision: check.revision + 1, updatedAt: now };
  await deps.checks.save(updated);
  return updated;
}

export interface AddCheckAdjustmentInput {
  tenantId: string;
  checkId: string;
  description: string;
  amountMinorUnits: number; // negative = discount, positive = service charge
  reason: string;
}

// POST /v1/checks/:id/add-adjustment
export async function addCheckAdjustment(deps: { checks: CheckRepositoryPort; now?: () => Date }, input: AddCheckAdjustmentInput): Promise<Check> {
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);
  if (check.status !== "OPEN") throw new Error(`Check ${check.id} is not OPEN`);

  const adjustment: CheckAdjustment = {
    id: randomUUID(),
    description: input.description,
    amountMinorUnits: input.amountMinorUnits,
    reason: input.reason,
  };
  const now = (deps.now ?? (() => new Date()))();
  const updated: Check = { ...check, adjustments: [...check.adjustments, adjustment], revision: check.revision + 1, updatedAt: now };
  await deps.checks.save(updated);
  return updated;
}

export interface RequestPaymentCheckInput {
  tenantId: string;
  checkId: string;
}

// POST /v1/checks/:id/request-payment — OPEN -> PAYMENT_PENDING.
export async function requestPaymentCheck(deps: { checks: CheckRepositoryPort; now?: () => Date }, input: RequestPaymentCheckInput): Promise<Check> {
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);
  assertCheckTransition(check.status, "PAYMENT_PENDING");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Check = { ...check, status: "PAYMENT_PENDING", revision: check.revision + 1, updatedAt: now };
  await deps.checks.save(updated);
  return updated;
}

export interface VoidCheckInput {
  tenantId: string;
  checkId: string;
  reason: string;
}

// POST /v1/checks/:id/void — manager-authorized.
export async function voidCheck(deps: { checks: CheckRepositoryPort; now?: () => Date }, input: VoidCheckInput): Promise<Check> {
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);
  assertCheckTransition(check.status, "VOID");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Check = { ...check, status: "VOID", revision: check.revision + 1, updatedAt: now };
  await deps.checks.save(updated);
  return updated;
}

export interface SettleCheckDeps {
  checks: CheckRepositoryPort;
  payments: PaymentRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export interface SettleCheckInput {
  tenantId: string;
  checkId: string;
  correlationId?: string;
}

// POST /v1/checks/:id/settle — exige balance=0.
export async function settleCheck(deps: SettleCheckDeps, input: SettleCheckInput): Promise<Check> {
  const check = await deps.checks.findById(input.tenantId, input.checkId);
  if (!check) throw new Error(`Check ${input.checkId} not found`);
  assertCheckTransition(check.status, "SETTLED");

  const payments = await deps.payments.listByCheck(input.tenantId, check.id);
  const paid = payments.reduce((sum, p) => sum + netCaptured(p), 0);
  const totals = computeCheckTotals(check, paid);
  if (totals.balance !== 0) throw new CheckNotBalancedError(totals.balance);

  const now = (deps.now ?? (() => new Date()))();
  const updated: Check = { ...check, status: "SETTLED", revision: check.revision + 1, updatedAt: now };
  await deps.checks.save(updated);
  await deps.outbox.append(checkSettledEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}
