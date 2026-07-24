// Reservation use cases (SPEC-071). Consolidated into one file per entity,
// mirroring @maitre/floor's visit-commands.ts.

import { randomUUID } from "node:crypto";
import {
  type Reservation,
  assertReservationTransition,
  blocksCapacity,
} from "../domain/reservation.js";
import { calculateAvailability, type AvailabilityWindow } from "../domain/calculate-availability.js";
import type { ReservationRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import {
  reservationCreatedEvent,
  reservationConfirmedEvent,
  reservationCancelledEvent,
} from "./events.js";

export interface ReservationDeps {
  reservations: ReservationRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export class CapacityUnavailableError extends Error {
  constructor() {
    super("No table with sufficient capacity is available for the requested window");
    this.name = "CapacityUnavailableError";
  }
}

export interface CreateReservationInput {
  id?: string;
  tenantId: string;
  branchId: string;
  guestId?: string;
  partySize: number;
  startAt: Date;
  durationMinutes: number;
  source?: string;
  cancellationPolicyId?: string;
  notes?: string;
  correlationId?: string;
}

// POST /v1/branches/{branchId}/reservations — creates PENDING. Per this
// implementation's scope note (reservation.ts), a PENDING reservation does
// NOT yet block capacity, so no capacity check is performed at create time
// — only at confirm time. This is the documented MVP simplification.
export async function createReservation(
  deps: ReservationDeps,
  input: CreateReservationInput,
): Promise<Reservation> {
  const now = (deps.now ?? (() => new Date()))();
  const reservation: Reservation = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    partySize: input.partySize,
    startAt: input.startAt,
    durationMinutes: input.durationMinutes,
    source: input.source ?? "INTERNAL",
    status: "PENDING",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.guestId ? { guestId: input.guestId } : {}),
    ...(input.cancellationPolicyId ? { cancellationPolicyId: input.cancellationPolicyId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  await deps.reservations.save(reservation);
  await deps.outbox.append(reservationCreatedEvent(reservation, input.correlationId ?? randomUUID()));
  return reservation;
}

export interface ConfirmReservationInput {
  tenantId: string;
  reservationId: string;
  tables: { id: string; capacity: number }[];
  correlationId?: string;
}

// POST /v1/reservations/{id}/confirm — PENDING -> CONFIRMED. Revalidates
// capacity against other CONFIRMED/SEATED reservations in the branch for
// the same window (simplified calculateAvailability, no Floor Occupancy
// input here — the route layer supplies that when available).
export async function confirmReservation(
  deps: ReservationDeps,
  input: ConfirmReservationInput,
): Promise<Reservation> {
  const reservation = await deps.reservations.findById(input.tenantId, input.reservationId);
  if (!reservation) throw new Error(`Reservation ${input.reservationId} not found`);
  assertReservationTransition(reservation.status, "CONFIRMED");

  const windowStart = reservation.startAt;
  const windowEnd = new Date(windowStart.getTime() + reservation.durationMinutes * 60_000);
  const others = (
    await deps.reservations.listActiveByBranchWindow(
      input.tenantId,
      reservation.branchId,
      windowStart,
      windowEnd,
    )
  ).filter((r) => r.id !== reservation.id && blocksCapacity(r));

  const reservedWindows = new Map<string, AvailabilityWindow[]>();
  for (const other of others) {
    if (!other.tableIds) continue;
    const otherEnd = new Date(other.startAt.getTime() + other.durationMinutes * 60_000);
    for (const tableId of other.tableIds) {
      const list = reservedWindows.get(tableId) ?? [];
      list.push({ start: other.startAt, end: otherEnd });
      reservedWindows.set(tableId, list);
    }
  }

  const result = calculateAvailability({
    partySize: reservation.partySize,
    startAt: reservation.startAt,
    durationMinutes: reservation.durationMinutes,
    tables: input.tables,
    reservedWindows,
    activeOccupancyTableIds: new Set(),
  });
  if (!result.available) throw new CapacityUnavailableError();

  const now = (deps.now ?? (() => new Date()))();
  const updated: Reservation = {
    ...reservation,
    status: "CONFIRMED",
    tableIds: [result.freeTableIds[0] as string],
    revision: reservation.revision + 1,
    updatedAt: now,
  };
  await deps.reservations.save(updated);
  await deps.outbox.append(reservationConfirmedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface CancelReservationInput {
  tenantId: string;
  reservationId: string;
  reasonCode: string;
  correlationId?: string;
}

// POST /v1/reservations/{id}/cancel — PENDING|CONFIRMED -> CANCELLED.
export async function cancelReservation(
  deps: ReservationDeps,
  input: CancelReservationInput,
): Promise<Reservation> {
  const reservation = await deps.reservations.findById(input.tenantId, input.reservationId);
  if (!reservation) throw new Error(`Reservation ${input.reservationId} not found`);
  assertReservationTransition(reservation.status, "CANCELLED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: Reservation = {
    ...reservation,
    status: "CANCELLED",
    cancelReason: input.reasonCode,
    cancelledAt: now,
    revision: reservation.revision + 1,
    updatedAt: now,
  };
  await deps.reservations.save(updated);
  await deps.outbox.append(
    reservationCancelledEvent(updated, input.reasonCode, input.correlationId ?? randomUUID()),
  );
  return updated;
}

export interface SeatReservationInput {
  tenantId: string;
  reservationId: string;
  visitId: string;
}

// POST /v1/reservations/{id}/seat — CONFIRMED -> SEATED. Links (does not
// create) a Visit — see reservations-api.test.ts for the documented
// approach: the route layer calls @maitre/floor's openVisit itself and
// passes the resulting visitId here, keeping this module decoupled from
// Floor's write path.
export async function seatReservation(
  deps: ReservationDeps,
  input: SeatReservationInput,
): Promise<Reservation> {
  const reservation = await deps.reservations.findById(input.tenantId, input.reservationId);
  if (!reservation) throw new Error(`Reservation ${input.reservationId} not found`);
  assertReservationTransition(reservation.status, "SEATED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: Reservation = {
    ...reservation,
    status: "SEATED",
    visitId: input.visitId,
    revision: reservation.revision + 1,
    updatedAt: now,
  };
  await deps.reservations.save(updated);
  return updated;
}

export interface MarkNoShowInput {
  tenantId: string;
  reservationId: string;
  reason: string;
}

// POST /v1/reservations/{id}/no-show — CONFIRMED -> NO_SHOW.
export async function markNoShow(deps: ReservationDeps, input: MarkNoShowInput): Promise<Reservation> {
  const reservation = await deps.reservations.findById(input.tenantId, input.reservationId);
  if (!reservation) throw new Error(`Reservation ${input.reservationId} not found`);
  assertReservationTransition(reservation.status, "NO_SHOW");

  const now = (deps.now ?? (() => new Date()))();
  const updated: Reservation = {
    ...reservation,
    status: "NO_SHOW",
    noShowReason: input.reason,
    revision: reservation.revision + 1,
    updatedAt: now,
  };
  await deps.reservations.save(updated);
  return updated;
}

export interface CompleteReservationInput {
  tenantId: string;
  reservationId: string;
}

// Called when the linked Visit closes (SPEC-066: "SEATED -> COMPLETED
// cuando la Visit vinculada cierra"). Invoked by the route layer after
// Floor's closeVisit succeeds, not automatically wired into Floor's outbox
// (no cross-module event subscription exists yet — documented gap).
export async function completeReservation(
  deps: ReservationDeps,
  input: CompleteReservationInput,
): Promise<Reservation> {
  const reservation = await deps.reservations.findById(input.tenantId, input.reservationId);
  if (!reservation) throw new Error(`Reservation ${input.reservationId} not found`);
  assertReservationTransition(reservation.status, "COMPLETED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: Reservation = {
    ...reservation,
    status: "COMPLETED",
    revision: reservation.revision + 1,
    updatedAt: now,
  };
  await deps.reservations.save(updated);
  return updated;
}
