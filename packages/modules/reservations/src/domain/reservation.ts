// SPEC-066 — Reservation domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the
// spec models capacity authority via a separate CapacityHold/CapacityAllocation
// ledger where a HELD hold already blocks capacity as soon as a Reservation
// is created. This implementation simplifies that: Reservation itself carries
// `status` and, once confirmed, `tableIds`. A PENDING reservation is NOT yet
// a capacity-blocking hold — availability (calculate-availability.ts) only
// counts CONFIRMED/SEATED reservations and Floor Occupancies. This is the
// single biggest deferred item versus SPEC-066/SPEC-079: two guests can both
// receive an available PENDING slot for the same window until one CONFIRMS.
// Acceptable for MVP per approved scope; revisit before real concurrent
// booking volume.
//
// Also deferred: no CapacityHold entity/expiry, no idempotency-key /
// If-Match enforcement (same precedent as Floor/Subscription/Catalog), no
// timezone/DST-aware scheduling (plain Date arithmetic), no
// CancellationPolicy version snapshot-freeze-at-confirm (Reservation just
// references cancellationPolicyId).

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "EXPIRED"
  | "SEATED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export interface Reservation {
  id: string;
  tenantId: string;
  branchId: string;
  guestId?: string;
  partySize: number;
  startAt: Date;
  durationMinutes: number;
  source: string;
  status: ReservationStatus;
  tableIds?: string[];
  visitId?: string;
  cancellationPolicyId?: string;
  cancelReason?: string;
  cancelledAt?: Date | null;
  noShowReason?: string;
  notes?: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["SEATED", "CANCELLED", "NO_SHOW"],
  SEATED: ["COMPLETED"],
  CANCELLED: [],
  EXPIRED: [],
  NO_SHOW: ["CONFIRMED"], // manager-only revert per SPEC-066, revalidated capacity
  COMPLETED: [],
};

export class InvalidReservationTransitionError extends Error {
  constructor(from: ReservationStatus, to: ReservationStatus) {
    super(`Reservation cannot transition from ${from} to ${to}`);
    this.name = "InvalidReservationTransitionError";
  }
}

export function canTransitionReservation(from: ReservationStatus, to: ReservationStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertReservationTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (!canTransitionReservation(from, to)) {
    throw new InvalidReservationTransitionError(from, to);
  }
}

// Reservations that occupy capacity for calculateAvailability purposes.
export function blocksCapacity(reservation: Reservation): boolean {
  return reservation.status === "CONFIRMED" || reservation.status === "SEATED";
}

export function reservationWindow(reservation: Reservation): { start: Date; end: Date } {
  const start = reservation.startAt;
  const end = new Date(start.getTime() + reservation.durationMinutes * 60_000);
  return { start, end };
}
