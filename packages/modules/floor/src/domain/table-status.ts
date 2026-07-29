// SPEC-051 — TableStatus projection.
//
// TableStatus is not stored: it is a pure projection over authoritative
// Floor inputs. Reservations and future operational blocks are composed by
// the API projection layer so this domain module stays independent.

import type { Occupancy } from "./occupancy.js";
import type { Check } from "./check.js";

export type TableStatusValue =
  | "BLOCKED"
  | "OCCUPIED"
  | "PAYING"
  | "CLEANING"
  | "RESERVED"
  | "AVAILABLE";

export interface TableStatusProjection {
  tableId: string;
  status: TableStatusValue;
  relatedVisitId?: string;
  relatedReservationId?: string;
  asOf: Date;
}

export interface ComputeTableStatusInput {
  tableId: string;
  occupancies: Occupancy[]; // all occupancies for this table (any status)
  checksByVisitId?: Map<string, Check>;
  now: Date;
}

export function computeTableStatus(input: ComputeTableStatusInput): TableStatusProjection {
  const active = input.occupancies.find((o) => o.status === "ACTIVE");
  if (!active) {
    return { tableId: input.tableId, status: "AVAILABLE", asOf: input.now };
  }

  const check = input.checksByVisitId?.get(active.visitId);
  if (check && check.status === "PAYMENT_PENDING") {
    return {
      tableId: input.tableId,
      status: "PAYING",
      relatedVisitId: active.visitId,
      asOf: input.now,
    };
  }

  return {
    tableId: input.tableId,
    status: "OCCUPIED",
    relatedVisitId: active.visitId,
    asOf: input.now,
  };
}
