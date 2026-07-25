// SPEC-132/133 — Cash outbox events. Envelope shape mirrors @maitre/ordering's
// and @maitre/floor's events.ts.
//
// SPEC-132 cash.cash-movement.recorded.v1 — emitted on every accepted
// CashMovement (including compensating ones). The legacy `CashRegistered` name
// is not publishable.
// SPEC-133 cash.cash-session.reconciled.v1 — emitted ONLY when a
// CashReconciliation is APPROVED.
//
// Payloads omit PII, free-text (reason/notes), evidence and denomination
// breakdowns, per SPEC-132/133 §payload mínimo.

import { randomUUID } from "node:crypto";
import type { CashMovement } from "../domain/cash-movement.js";
import type { CashReconciliation } from "../domain/cash-reconciliation.js";
import type { OutboxRecord } from "./outbox.js";

function record<T>(
  eventName: string,
  aggregateType: string,
  aggregateId: string,
  tenantId: string,
  correlationId: string,
  occurredAt: Date,
  payload: T,
): OutboxRecord<T> {
  return {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    occurredAt,
    producer: "cash",
    tenantId,
    aggregateType,
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

export interface CashMovementRecordedPayload {
  tenantId: string;
  branchId: string;
  brandId?: string;
  cashRegisterId: string;
  cashSessionId: string;
  cashMovementId: string;
  type: string;
  direction: string;
  amountMinorUnits: number;
  currency: string;
  sourceType?: string;
  sourceReferenceOpaque?: string;
  occurredAt: Date;
  recordedAt: Date;
  ledgerRevision: number;
}

export function cashMovementRecordedEvent(
  movement: CashMovement,
  correlationId: string,
  brandId?: string,
): OutboxRecord<CashMovementRecordedPayload> {
  return record(
    "cash.cash-movement.recorded.v1",
    "CashSession",
    movement.cashSessionId,
    movement.tenantId,
    correlationId,
    movement.occurredAt,
    {
      tenantId: movement.tenantId,
      branchId: movement.branchId,
      cashRegisterId: movement.cashRegisterId,
      cashSessionId: movement.cashSessionId,
      cashMovementId: movement.id,
      type: movement.type,
      direction: movement.direction,
      amountMinorUnits: movement.amountMinorUnits,
      currency: movement.currency,
      occurredAt: movement.occurredAt,
      recordedAt: movement.recordedAt,
      ledgerRevision: movement.ledgerRevision,
      ...(brandId ? { brandId } : {}),
      ...(movement.sourceType ? { sourceType: movement.sourceType } : {}),
      // Only an opaque reference is emitted — never the raw source object.
      ...(movement.sourceReference ? { sourceReferenceOpaque: movement.sourceReference } : {}),
    },
  );
}

export interface CashSessionReconciledPayload {
  tenantId: string;
  branchId: string;
  brandId?: string;
  cashRegisterId: string;
  cashSessionId: string;
  cashReconciliationId: string;
  currency: string;
  ledgerRevision: number;
  expectedMinorUnits: number;
  countedMinorUnits: number;
  differenceMinorUnits: number;
  approvedAt: Date;
  aggregateRevision: number;
}

export function cashSessionReconciledEvent(
  reconciliation: CashReconciliation,
  correlationId: string,
  brandId?: string,
): OutboxRecord<CashSessionReconciledPayload> {
  const approvedAt = reconciliation.approvedAt ?? new Date();
  return record(
    "cash.cash-session.reconciled.v1",
    "CashSession",
    reconciliation.cashSessionId,
    reconciliation.tenantId,
    correlationId,
    approvedAt,
    {
      tenantId: reconciliation.tenantId,
      branchId: reconciliation.branchId,
      cashRegisterId: reconciliation.cashRegisterId,
      cashSessionId: reconciliation.cashSessionId,
      cashReconciliationId: reconciliation.id,
      currency: reconciliation.currency,
      ledgerRevision: reconciliation.ledgerRevision,
      expectedMinorUnits: reconciliation.expectedMinorUnits,
      countedMinorUnits: reconciliation.countedMinorUnits ?? 0,
      differenceMinorUnits: reconciliation.differenceMinorUnits ?? 0,
      approvedAt,
      aggregateRevision: reconciliation.attempt,
      ...(brandId ? { brandId } : {}),
    },
  );
}
