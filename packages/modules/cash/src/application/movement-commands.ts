// SPEC-125/129 — CashMovement use cases: record + compensate.
//
// The journal is immutable: there is no update/delete. A correction is a NEW
// compensating movement (type ADJUSTMENT, inverse direction) linked to the
// original via `compensatesMovementId`. Every accepted movement (including
// compensating ones) increments the session ledger revision and emits
// cash.cash-movement.recorded.v1.

import { randomUUID } from "node:crypto";
import {
  type CashMovement,
  type CashMovementType,
  type CashMovementDirection,
  directionForType,
  assertValidMovementAmount,
} from "../domain/cash-movement.js";
import { type CashSession, InvalidCashSessionStateError } from "../domain/cash-session.js";
import type {
  CashSessionRepositoryPort,
  CashMovementRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { cashMovementRecordedEvent } from "./events.js";

export interface MovementDeps {
  sessions: CashSessionRepositoryPort;
  movements: CashMovementRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export class CurrencyMismatchError extends Error {
  constructor(sessionCurrency: string, movementCurrency: string) {
    super(`Movement currency ${movementCurrency} does not match session currency ${sessionCurrency}`);
    this.name = "CurrencyMismatchError";
  }
}

export class DuplicateSourceReferenceError extends Error {
  constructor(sourceReference: string, cashRegisterId: string) {
    super(`sourceReference "${sourceReference}" already recorded for register ${cashRegisterId}`);
    this.name = "DuplicateSourceReferenceError";
  }
}

export class SessionNotAcceptingMovementsError extends Error {
  constructor(sessionId: string, status: string, type: CashMovementType) {
    super(`CashSession ${sessionId} is ${status}, cannot record a ${type} movement`);
    this.name = "SessionNotAcceptingMovementsError";
  }
}

// Ordinary movements require an OPEN session. CLOSING_COUNT (informational,
// evidence-only) is also allowed while CLOSING — begin-close blocks ordinary
// movements but the physical count still needs recording.
function assertSessionAcceptsMovement(session: CashSession, type: CashMovementType): void {
  if (session.status === "OPEN") return;
  if (session.status === "CLOSING" && type === "CLOSING_COUNT") return;
  throw new SessionNotAcceptingMovementsError(session.id, session.status, type);
}

// Shared internal: persist a movement, bump the session ledger revision, emit.
async function appendMovement(
  deps: MovementDeps,
  session: CashSession,
  fields: {
    type: CashMovementType;
    direction: CashMovementDirection;
    amountMinorUnits: number;
    actor: string;
    occurredAt: Date;
    recordedAt: Date;
    sourceType?: string;
    sourceReference?: string;
    compensatesMovementId?: string;
    idempotencyKey?: string;
    reason?: string;
    correlationId: string;
  },
): Promise<CashMovement> {
  // CLOSING_COUNT is informational and does not affect the ledger balance, but
  // we still advance the revision so the journal ordering is monotonic.
  const nextRevision = session.ledgerRevision + 1;
  const updatedSession: CashSession = {
    ...session,
    ledgerRevision: nextRevision,
    updatedAt: fields.recordedAt,
  };
  await deps.sessions.save(updatedSession);

  const movement: CashMovement = {
    id: randomUUID(),
    tenantId: session.tenantId,
    branchId: session.branchId,
    cashRegisterId: session.cashRegisterId,
    cashSessionId: session.id,
    currency: session.currency,
    type: fields.type,
    direction: fields.direction,
    amountMinorUnits: fields.amountMinorUnits,
    actor: fields.actor,
    ledgerRevision: nextRevision,
    occurredAt: fields.occurredAt,
    recordedAt: fields.recordedAt,
    sourceType: fields.sourceType ?? null,
    sourceReference: fields.sourceReference ?? null,
    compensatesMovementId: fields.compensatesMovementId ?? null,
    idempotencyKey: fields.idempotencyKey ?? null,
    reason: fields.reason ?? null,
  };
  await deps.movements.save(movement);
  await deps.outbox.append(cashMovementRecordedEvent(movement, fields.correlationId));
  return movement;
}

export interface RecordMovementInput {
  tenantId: string;
  cashSessionId: string;
  type: CashMovementType;
  amountMinorUnits: number;
  currency: string;
  actor: string;
  direction?: CashMovementDirection; // required only for ADJUSTMENT
  sourceType?: string;
  sourceReference?: string;
  idempotencyKey?: string;
  reason?: string;
  occurredAt?: Date;
  correlationId?: string;
}

export async function recordMovement(deps: MovementDeps, input: RecordMovementInput): Promise<CashMovement> {
  const session = await deps.sessions.findById(input.tenantId, input.cashSessionId);
  if (!session) throw new Error(`CashSession ${input.cashSessionId} not found`);
  assertSessionAcceptsMovement(session, input.type);
  assertValidMovementAmount(input.amountMinorUnits);
  if (input.currency !== session.currency) throw new CurrencyMismatchError(session.currency, input.currency);

  const direction = directionForType(input.type, input.direction);

  if (input.sourceReference) {
    const dup = await deps.movements.findByRegisterAndSourceReference(
      input.tenantId,
      session.cashRegisterId,
      input.sourceReference,
    );
    if (dup) throw new DuplicateSourceReferenceError(input.sourceReference, session.cashRegisterId);
  }

  const now = nowFrom(deps);
  return appendMovement(deps, session, {
    type: input.type,
    direction,
    amountMinorUnits: input.amountMinorUnits,
    actor: input.actor,
    occurredAt: input.occurredAt ?? now,
    recordedAt: now,
    correlationId: input.correlationId ?? randomUUID(),
    ...(input.sourceType ? { sourceType: input.sourceType } : {}),
    ...(input.sourceReference ? { sourceReference: input.sourceReference } : {}),
    ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
    ...(input.reason ? { reason: input.reason } : {}),
  });
}

// POST /v1/cash-movements/:id/compensate — creates the inverse ADJUSTMENT
// movement linked to the original. Never mutates or deletes the original.
export interface CompensateMovementInput {
  tenantId: string;
  cashMovementId: string;
  actor: string;
  reason?: string;
  correlationId?: string;
}

export async function compensateMovement(
  deps: MovementDeps,
  input: CompensateMovementInput,
): Promise<CashMovement> {
  const original = await deps.movements.findById(input.tenantId, input.cashMovementId);
  if (!original) throw new Error(`CashMovement ${input.cashMovementId} not found`);
  if (original.type === "CLOSING_COUNT") {
    throw new InvalidCashSessionStateError("CLOSING_COUNT movements are informational and cannot be compensated");
  }
  const session = await deps.sessions.findById(input.tenantId, original.cashSessionId);
  if (!session) throw new Error(`CashSession ${original.cashSessionId} not found`);
  if (session.status === "CLOSED" || session.status === "RECONCILED") {
    throw new InvalidCashSessionStateError(
      `CashSession ${session.id} is ${session.status}; its ledger is frozen and cannot be compensated`,
    );
  }

  const inverse: CashMovementDirection = original.direction === "IN" ? "OUT" : "IN";
  const now = nowFrom(deps);
  return appendMovement(deps, session, {
    type: "ADJUSTMENT",
    direction: inverse,
    amountMinorUnits: original.amountMinorUnits,
    actor: input.actor,
    occurredAt: now,
    recordedAt: now,
    compensatesMovementId: original.id,
    correlationId: input.correlationId ?? randomUUID(),
    reason: input.reason ?? `Compensation of ${original.id}`,
  });
}
