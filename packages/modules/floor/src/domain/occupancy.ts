// SPEC-050 — Occupancy domain model.
//
// SCOPE NOTE: full [startedAt, endedAt) interval history + ordered
// multi-table locking is deferred (see visit.ts). This model keeps one
// Occupancy row per seat-until-close; `close` sets endedAt and status
// CLOSED, never reopened. The hard invariant enforced is: no two ACTIVE
// occupancies for the same tableId (checked by the use case against the
// repository, not here).

export type OccupancyStatus = "ACTIVE" | "CLOSED";

export interface Occupancy {
  id: string;
  tenantId: string;
  branchId: string;
  tableId: string;
  visitId: string;
  guestCount: number;
  status: OccupancyStatus;
  startedAt: Date;
  endedAt?: Date | null;
  revision: number;
}

export class TableAlreadyOccupiedError extends Error {
  constructor(tableId: string) {
    super(`Table ${tableId} already has an ACTIVE occupancy`);
    this.name = "TableAlreadyOccupiedError";
  }
}

export function closeOccupancy(occupancy: Occupancy, now: Date): Occupancy {
  if (occupancy.status !== "ACTIVE") {
    throw new Error(`Occupancy ${occupancy.id} is not ACTIVE`);
  }
  return { ...occupancy, status: "CLOSED", endedAt: now, revision: occupancy.revision + 1 };
}
