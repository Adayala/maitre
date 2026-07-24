import { randomUUID } from "node:crypto";
import type { Reservation } from "../domain/reservation.js";
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
    producer: "reservations",
    tenantId,
    aggregateType,
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

// SPEC-076 — ReservationCreated, emitted when a new Reservation PENDING is
// persisted. Omits Guest/contact/notes/preferences per spec. No separate
// CapacityHold entity exists in this simplified model (see reservation.ts
// scope note), so capacityHoldId/holdExpiresAt are omitted from the payload
// rather than fabricated.
export interface ReservationCreatedPayload {
  reservationId: string;
  branchId: string;
  startAt: string;
  durationMinutes: number;
  partySize: number;
  source: string;
  status: string;
  aggregateRevision: number;
}

export function reservationCreatedEvent(
  reservation: Reservation,
  correlationId: string,
): OutboxRecord<ReservationCreatedPayload> {
  return record(
    "reservations.reservation.created.v1",
    "Reservation",
    reservation.id,
    reservation.tenantId,
    correlationId,
    reservation.createdAt,
    {
      reservationId: reservation.id,
      branchId: reservation.branchId,
      startAt: reservation.startAt.toISOString(),
      durationMinutes: reservation.durationMinutes,
      partySize: reservation.partySize,
      source: reservation.source,
      status: reservation.status,
      aggregateRevision: reservation.revision,
    },
  );
}

// SPEC-077 — ReservationConfirmed, emitted only after PENDING->CONFIRMED.
// No PII. tableIds included when already assigned at confirm time.
export interface ReservationConfirmedPayload {
  reservationId: string;
  branchId: string;
  startAt: string;
  durationMinutes: number;
  partySize: number;
  tableIds?: string[];
  confirmedAt: string;
  aggregateRevision: number;
}

export function reservationConfirmedEvent(
  reservation: Reservation,
  correlationId: string,
): OutboxRecord<ReservationConfirmedPayload> {
  return record(
    "reservations.reservation.confirmed.v1",
    "Reservation",
    reservation.id,
    reservation.tenantId,
    correlationId,
    reservation.updatedAt,
    {
      reservationId: reservation.id,
      branchId: reservation.branchId,
      startAt: reservation.startAt.toISOString(),
      durationMinutes: reservation.durationMinutes,
      partySize: reservation.partySize,
      ...(reservation.tableIds ? { tableIds: reservation.tableIds } : {}),
      confirmedAt: reservation.updatedAt.toISOString(),
      aggregateRevision: reservation.revision,
    },
  );
}

// SPEC-078 — ReservationCancelled, emitted in the same "transaction" that
// moves a Reservation to CANCELLED. No free text/PII; reasonCode is a
// categorized string, actorType always INTERNAL (no public/system callers
// in this implementation).
export interface ReservationCancelledPayload {
  reservationId: string;
  branchId: string;
  cancelledAt: string;
  reasonCode: string;
  actorType: "INTERNAL" | "PUBLIC" | "SYSTEM";
  aggregateRevision: number;
}

export function reservationCancelledEvent(
  reservation: Reservation,
  reasonCode: string,
  correlationId: string,
): OutboxRecord<ReservationCancelledPayload> {
  const cancelledAt = reservation.cancelledAt ?? new Date();
  return record(
    "reservations.reservation.cancelled.v1",
    "Reservation",
    reservation.id,
    reservation.tenantId,
    correlationId,
    cancelledAt,
    {
      reservationId: reservation.id,
      branchId: reservation.branchId,
      cancelledAt: cancelledAt.toISOString(),
      reasonCode,
      actorType: "INTERNAL",
      aggregateRevision: reservation.revision,
    },
  );
}
