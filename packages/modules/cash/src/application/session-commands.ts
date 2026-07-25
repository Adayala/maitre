// SPEC-124/128 — CashSession lifecycle use cases: open-session, begin-close,
// close-session, suspend, resume.
//
// close-session freezes the ledger revision and creates a DRAFT
// CashReconciliation whose `expected` is computed server-side from the frozen
// ledger (never client-supplied).

import { randomUUID } from "node:crypto";
import {
  type CashSession,
  assertCashSessionTransition,
  SessionAlreadyOpenError,
  InvalidCashSessionStateError,
} from "../domain/cash-session.js";
import {
  type CashReconciliation,
  computeExpectedMinorUnits,
} from "../domain/cash-reconciliation.js";
import type {
  CashRegisterRepositoryPort,
  CashSessionRepositoryPort,
  CashMovementRepositoryPort,
  CashReconciliationRepositoryPort,
} from "./ports.js";

export interface SessionDeps {
  registers: CashRegisterRepositoryPort;
  sessions: CashSessionRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadSession(
  deps: { sessions: CashSessionRepositoryPort },
  tenantId: string,
  id: string,
): Promise<CashSession> {
  const session = await deps.sessions.findById(tenantId, id);
  if (!session) throw new Error(`CashSession ${id} not found`);
  return session;
}

export class CurrencyNotAllowedError extends Error {
  constructor(currency: string, cashRegisterId: string) {
    super(`Currency ${currency} is not allowed for register ${cashRegisterId}`);
    this.name = "CurrencyNotAllowedError";
  }
}

// POST /v1/cash-registers/:id/sessions — open a session. Enforces the
// one-OPEN/CLOSING-per-(register,currency) invariant.
export interface OpenSessionInput {
  id?: string;
  tenantId: string;
  cashRegisterId: string;
  currency: string;
  businessDate: string;
  timezone: string;
  openingAmountMinorUnits: number;
  openedBy: string;
}

export async function openSession(deps: SessionDeps, input: OpenSessionInput): Promise<CashSession> {
  const register = await deps.registers.findById(input.tenantId, input.cashRegisterId);
  if (!register) throw new Error(`CashRegister ${input.cashRegisterId} not found`);
  if (register.status !== "ACTIVE") {
    throw new InvalidCashSessionStateError(`CashRegister ${register.id} is ${register.status}, cannot open a session`);
  }
  if (!register.allowedCurrencies.includes(input.currency)) {
    throw new CurrencyNotAllowedError(input.currency, register.id);
  }
  if (!Number.isInteger(input.openingAmountMinorUnits) || input.openingAmountMinorUnits < 0) {
    throw new InvalidCashSessionStateError(
      `Opening amount ${input.openingAmountMinorUnits} must be a non-negative integer (minor units)`,
    );
  }

  const live = await deps.sessions.findLiveByRegisterAndCurrency(
    input.tenantId,
    input.cashRegisterId,
    input.currency,
  );
  if (live) throw new SessionAlreadyOpenError(input.cashRegisterId, input.currency);

  const now = nowFrom(deps);
  const session: CashSession = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: register.branchId,
    cashRegisterId: register.id,
    currency: input.currency,
    businessDate: input.businessDate,
    timezone: input.timezone,
    openingAmountMinorUnits: input.openingAmountMinorUnits,
    openedAt: now,
    openedBy: input.openedBy,
    cutoffAt: null,
    closedAt: null,
    closedBy: null,
    ledgerRevision: 0,
    status: "OPEN",
    suspended: false,
    createdAt: now,
    updatedAt: now,
  };
  await deps.sessions.save(session);
  return session;
}

// POST /v1/cash-sessions/:id/begin-close — OPEN -> CLOSING, sets cutoffAt.
// Blocks new ordinary movements (recordMovement rejects non-CLOSING_COUNT types
// while CLOSING).
export async function beginCloseSession(
  deps: SessionDeps,
  input: { tenantId: string; id: string },
): Promise<CashSession> {
  const session = await loadSession(deps, input.tenantId, input.id);
  assertCashSessionTransition(session.status, "CLOSING");
  const now = nowFrom(deps);
  const updated: CashSession = { ...session, status: "CLOSING", cutoffAt: now, updatedAt: now };
  await deps.sessions.save(updated);
  return updated;
}

export interface CloseSessionDeps extends SessionDeps {
  movements: CashMovementRepositoryPort;
  reconciliations: CashReconciliationRepositoryPort;
}

export interface CloseSessionResult {
  session: CashSession;
  reconciliation: CashReconciliation;
}

// POST /v1/cash-sessions/:id/close — CLOSING -> CLOSED. Freezes the ledger
// revision and creates a DRAFT CashReconciliation with a server-computed
// `expected`.
export async function closeSession(
  deps: CloseSessionDeps,
  input: { tenantId: string; id: string; closedBy: string },
): Promise<CloseSessionResult> {
  const session = await loadSession(deps, input.tenantId, input.id);
  assertCashSessionTransition(session.status, "CLOSED");
  const now = nowFrom(deps);
  const closed: CashSession = {
    ...session,
    status: "CLOSED",
    closedAt: now,
    closedBy: input.closedBy,
    updatedAt: now,
  };
  await deps.sessions.save(closed);

  const movements = await deps.movements.listBySession(input.tenantId, session.id);
  const expected = computeExpectedMinorUnits(session.openingAmountMinorUnits, movements);
  const reconciliation: CashReconciliation = {
    id: randomUUID(),
    tenantId: session.tenantId,
    branchId: session.branchId,
    cashRegisterId: session.cashRegisterId,
    cashSessionId: session.id,
    currency: session.currency,
    ledgerRevision: closed.ledgerRevision,
    attempt: 1,
    countedMinorUnits: null,
    expectedMinorUnits: expected,
    differenceMinorUnits: null,
    status: "DRAFT",
    preparedBy: input.closedBy,
    preparedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await deps.reconciliations.save(reconciliation);
  return { session: closed, reconciliation };
}

// POST /v1/cash-sessions/:id/suspend — sets the operational `suspended` flag
// (does not change the lifecycle state). Only meaningful while OPEN/CLOSING.
export async function suspendSession(
  deps: SessionDeps,
  input: { tenantId: string; id: string },
): Promise<CashSession> {
  const session = await loadSession(deps, input.tenantId, input.id);
  if (session.status === "CLOSED" || session.status === "RECONCILED") {
    throw new InvalidCashSessionStateError(`CashSession ${session.id} is ${session.status}, cannot suspend`);
  }
  const now = nowFrom(deps);
  const updated: CashSession = { ...session, suspended: true, updatedAt: now };
  await deps.sessions.save(updated);
  return updated;
}

export async function resumeSession(
  deps: SessionDeps,
  input: { tenantId: string; id: string },
): Promise<CashSession> {
  const session = await loadSession(deps, input.tenantId, input.id);
  if (session.status === "CLOSED" || session.status === "RECONCILED") {
    throw new InvalidCashSessionStateError(`CashSession ${session.id} is ${session.status}, cannot resume`);
  }
  const now = nowFrom(deps);
  const updated: CashSession = { ...session, suspended: false, updatedAt: now };
  await deps.sessions.save(updated);
  return updated;
}
