// SPEC-126/130 — CashReconciliation use cases: get expected summary, record
// counts, submit, approve, reject.
//
// `expected` is always recomputed server-side from the session's frozen ledger.
// The client only ever supplies `counted`.

import { randomUUID } from "node:crypto";
import {
  type CashReconciliation,
  computeExpectedMinorUnits,
  computeDifferenceMinorUnits,
  assertReconciliationTransition,
  InvalidReconciliationStateError,
} from "../domain/cash-reconciliation.js";
import { type CashSession, assertCashSessionTransition } from "../domain/cash-session.js";
import type {
  CashSessionRepositoryPort,
  CashMovementRepositoryPort,
  CashReconciliationRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { cashSessionReconciledEvent } from "./events.js";

export interface ReconciliationDeps {
  sessions: CashSessionRepositoryPort;
  movements: CashMovementRepositoryPort;
  reconciliations: CashReconciliationRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadReconciliation(
  deps: ReconciliationDeps,
  tenantId: string,
  id: string,
): Promise<CashReconciliation> {
  const rec = await deps.reconciliations.findById(tenantId, id);
  if (!rec) throw new Error(`CashReconciliation ${id} not found`);
  return rec;
}

export interface ExpectedSummary {
  cashReconciliationId: string;
  cashSessionId: string;
  currency: string;
  ledgerRevision: number;
  openingMinorUnits: number;
  expectedMinorUnits: number;
  countedMinorUnits: number | null;
  differenceMinorUnits: number | null;
  status: CashReconciliation["status"];
}

// GET — read-only recompute of the expected equation from the frozen ledger.
export async function getExpectedSummary(
  deps: ReconciliationDeps,
  input: { tenantId: string; id: string },
): Promise<ExpectedSummary> {
  const rec = await loadReconciliation(deps, input.tenantId, input.id);
  const session = await deps.sessions.findById(input.tenantId, rec.cashSessionId);
  if (!session) throw new Error(`CashSession ${rec.cashSessionId} not found`);
  const movements = await deps.movements.listBySession(input.tenantId, rec.cashSessionId);
  const expected = computeExpectedMinorUnits(session.openingAmountMinorUnits, movements);
  return {
    cashReconciliationId: rec.id,
    cashSessionId: rec.cashSessionId,
    currency: rec.currency,
    ledgerRevision: rec.ledgerRevision,
    openingMinorUnits: session.openingAmountMinorUnits,
    expectedMinorUnits: expected,
    countedMinorUnits: rec.countedMinorUnits,
    differenceMinorUnits: rec.countedMinorUnits === null ? null : rec.countedMinorUnits - expected,
    status: rec.status,
  };
}

// POST /record-counts — DRAFT (or REJECTED -> new attempt) only. Sets counted
// and recomputes difference against the (recomputed) expected.
export interface RecordCountsInput {
  tenantId: string;
  id: string;
  countedMinorUnits: number;
}

export async function recordCounts(
  deps: ReconciliationDeps,
  input: RecordCountsInput,
): Promise<CashReconciliation> {
  if (!Number.isInteger(input.countedMinorUnits) || input.countedMinorUnits < 0) {
    throw new InvalidReconciliationStateError(
      `countedMinorUnits ${input.countedMinorUnits} must be a non-negative integer`,
    );
  }
  const rec = await loadReconciliation(deps, input.tenantId, input.id);

  // A rejected reconciliation re-opens as a fresh DRAFT attempt.
  let attempt = rec.attempt;
  if (rec.status === "REJECTED") {
    assertReconciliationTransition(rec.status, "DRAFT");
    attempt = rec.attempt + 1;
  } else if (rec.status !== "DRAFT") {
    throw new InvalidReconciliationStateError(
      `CashReconciliation ${rec.id} is ${rec.status}; counts can only be recorded in DRAFT`,
    );
  }

  const session = await deps.sessions.findById(input.tenantId, rec.cashSessionId);
  if (!session) throw new Error(`CashSession ${rec.cashSessionId} not found`);
  const movements = await deps.movements.listBySession(input.tenantId, rec.cashSessionId);
  const expected = computeExpectedMinorUnits(session.openingAmountMinorUnits, movements);

  const now = nowFrom(deps);
  const updated: CashReconciliation = {
    ...rec,
    status: "DRAFT",
    attempt,
    expectedMinorUnits: expected,
    countedMinorUnits: input.countedMinorUnits,
    differenceMinorUnits: computeDifferenceMinorUnits(input.countedMinorUnits, expected),
    submittedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    updatedAt: now,
  };
  await deps.reconciliations.save(updated);
  return updated;
}

// POST /submit — DRAFT -> SUBMITTED. Requires counts recorded.
export async function submitReconciliation(
  deps: ReconciliationDeps,
  input: { tenantId: string; id: string },
): Promise<CashReconciliation> {
  const rec = await loadReconciliation(deps, input.tenantId, input.id);
  assertReconciliationTransition(rec.status, "SUBMITTED");
  if (rec.countedMinorUnits === null) {
    throw new InvalidReconciliationStateError(
      `CashReconciliation ${rec.id} has no recorded counts; record counts before submitting`,
    );
  }
  const now = nowFrom(deps);
  const updated: CashReconciliation = { ...rec, status: "SUBMITTED", submittedAt: now, updatedAt: now };
  await deps.reconciliations.save(updated);
  return updated;
}

export interface ApproveReconciliationDeps extends ReconciliationDeps {
  outbox: OutboxPort;
}

// POST /approve — SUBMITTED -> APPROVED. Transitions the session to RECONCILED
// and emits cash.cash-session.reconciled.v1.
//
// SCOPE NOTE: segregation of duties (approver != preparer) is NOT hard-enforced
// here — the route's cash.reconciliation.approve permission is the only gate.
export async function approveReconciliation(
  deps: ApproveReconciliationDeps,
  input: { tenantId: string; id: string; approvedBy: string; correlationId?: string },
): Promise<CashReconciliation> {
  const rec = await loadReconciliation(deps, input.tenantId, input.id);
  assertReconciliationTransition(rec.status, "APPROVED");
  const session = await deps.sessions.findById(input.tenantId, rec.cashSessionId);
  if (!session) throw new Error(`CashSession ${rec.cashSessionId} not found`);

  const now = nowFrom(deps);
  const approved: CashReconciliation = {
    ...rec,
    status: "APPROVED",
    approvedBy: input.approvedBy,
    approvedAt: now,
    updatedAt: now,
  };
  await deps.reconciliations.save(approved);

  // Session CLOSED -> RECONCILED.
  assertCashSessionTransition(session.status, "RECONCILED");
  const reconciledSession: CashSession = { ...session, status: "RECONCILED", updatedAt: now };
  await deps.sessions.save(reconciledSession);

  await deps.outbox.append(cashSessionReconciledEvent(approved, input.correlationId ?? randomUUID()));
  return approved;
}

// POST /reject — SUBMITTED -> REJECTED. Preserves history; a fresh DRAFT attempt
// can then be re-driven via record-counts (SPEC-126 versioned resubmit,
// simplified to an attempt counter).
export async function rejectReconciliation(
  deps: ReconciliationDeps,
  input: { tenantId: string; id: string; rejectedBy: string; reason?: string },
): Promise<CashReconciliation> {
  const rec = await loadReconciliation(deps, input.tenantId, input.id);
  assertReconciliationTransition(rec.status, "REJECTED");
  const now = nowFrom(deps);
  const updated: CashReconciliation = {
    ...rec,
    status: "REJECTED",
    rejectedBy: input.rejectedBy,
    rejectedAt: now,
    rejectionReason: input.reason ?? null,
    updatedAt: now,
  };
  await deps.reconciliations.save(updated);
  return updated;
}
