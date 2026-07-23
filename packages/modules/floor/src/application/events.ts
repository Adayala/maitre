import { randomUUID } from "node:crypto";
import type { Visit } from "../domain/visit.js";
import type { Check } from "../domain/check.js";
import type { Payment } from "../domain/payment.js";
import type { Occupancy } from "../domain/occupancy.js";
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
    producer: "floor",
    tenantId,
    aggregateType,
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

// SPEC-061 — VisitOpened, emitted with the initial Occupancies in the same call.
export interface VisitOpenedPayload {
  visitId: string;
  branchId: string;
  tableIds: string[];
  guestCount: number;
  occupancyIds: string[];
}

export function visitOpenedEvent(
  visit: Visit,
  occupancies: Occupancy[],
  correlationId: string,
): OutboxRecord<VisitOpenedPayload> {
  return record(
    "floor.visit.opened.v1",
    "Visit",
    visit.id,
    visit.tenantId,
    correlationId,
    visit.createdAt,
    {
      visitId: visit.id,
      branchId: visit.branchId,
      tableIds: visit.tableIds,
      guestCount: visit.guestCount,
      occupancyIds: occupancies.map((o) => o.id),
    },
  );
}

// SPEC-062 — VisitClosed, only on CLOSING->CLOSED.
export interface VisitClosedPayload {
  visitId: string;
  branchId: string;
  closedAt: Date;
}

export function visitClosedEvent(visit: Visit, correlationId: string): OutboxRecord<VisitClosedPayload> {
  return record(
    "floor.visit.closed.v1",
    "Visit",
    visit.id,
    visit.tenantId,
    correlationId,
    visit.closedAt ?? new Date(),
    { visitId: visit.id, branchId: visit.branchId, closedAt: visit.closedAt ?? new Date() },
  );
}

// SPEC-064 — CheckGenerated on Check creation.
export interface CheckGeneratedPayload {
  checkId: string;
  visitId: string;
  branchId: string;
}

export function checkGeneratedEvent(check: Check, correlationId: string): OutboxRecord<CheckGeneratedPayload> {
  return record(
    "floor.check.opened.v1",
    "Check",
    check.id,
    check.tenantId,
    correlationId,
    check.createdAt,
    { checkId: check.id, visitId: check.visitId, branchId: check.branchId },
  );
}

export interface CheckSettledPayload {
  checkId: string;
  visitId: string;
  branchId: string;
}

export function checkSettledEvent(check: Check, correlationId: string): OutboxRecord<CheckSettledPayload> {
  return record(
    "floor.check.settled.v1",
    "Check",
    check.id,
    check.tenantId,
    correlationId,
    check.updatedAt,
    { checkId: check.id, visitId: check.visitId, branchId: check.branchId },
  );
}

// SPEC-063 — PaymentProcessed terminal events. The simplified synchronous
// lifecycle never reaches AUTHORIZED-without-capture or refund.failed
// through the API surfaces we implement (create-intent goes straight to
// PENDING then capture is a direct PENDING/AUTHORIZED->CAPTURED call), so
// only captured/failed/voided/refund.succeeded are emitted. authorized.v1
// and refund.failed.v1 are documented gaps, not oversights.
export interface PaymentEventPayload {
  paymentId: string;
  checkId: string;
  branchId: string;
  amountMinorUnits: number;
  currency: string;
}

function paymentEvent(
  eventName: string,
  payment: Payment,
  correlationId: string,
): OutboxRecord<PaymentEventPayload> {
  return record(eventName, "Payment", payment.id, payment.tenantId, correlationId, payment.updatedAt, {
    paymentId: payment.id,
    checkId: payment.checkId,
    branchId: payment.branchId,
    amountMinorUnits: payment.amountMinorUnits,
    currency: payment.currency,
  });
}

export const paymentCapturedEvent = (payment: Payment, correlationId: string) =>
  paymentEvent("payment.captured.v1", payment, correlationId);
export const paymentFailedEvent = (payment: Payment, correlationId: string) =>
  paymentEvent("payment.failed.v1", payment, correlationId);
export const paymentVoidedEvent = (payment: Payment, correlationId: string) =>
  paymentEvent("payment.voided.v1", payment, correlationId);
export const refundSucceededEvent = (payment: Payment, correlationId: string) =>
  paymentEvent("refund.succeeded.v1", payment, correlationId);
