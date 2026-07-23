// SPEC-051 — TableStatus projection.
//
// SCOPE NOTE (approved simplification): TableStatus is NOT a stored
// entity — it's a pure computed projection. Precedence per spec is
// BLOCKED > OCCUPIED/PAYING > CLEANING > RESERVED > AVAILABLE, but this
// implementation can only derive OCCUPIED/PAYING/AVAILABLE — BLOCKED,
// CLEANING and RESERVED require the Reservations domain (Fase 2 #2) and
// manual floor-ops features that don't exist yet.

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
