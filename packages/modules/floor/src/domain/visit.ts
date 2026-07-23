// SPEC-049 — Visit domain model.
//
// SCOPE NOTE: per the approved "CRUD simple + invariantes clave" decision,
// tableIds is a plain string[] replaced wholesale by `move` (no versioned
// per-table assignment history). Multi-table seating does not yet lock
// Tables ordered by id (contract.md's deadlock-avoidance requirement) —
// seat/move call the Occupancy repository sequentially per table. This
// must be revisited before real concurrent multi-table seating ships.

export type VisitStatus = "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";

export interface Visit {
  id: string;
  tenantId: string;
  branchId: string;
  tableIds: string[];
  guestCount: number;
  reservationId?: string;
  status: VisitStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date | null;
  cancelledAt?: Date | null;
  cancelReason?: string;
}

const allowedTransitions: Record<VisitStatus, VisitStatus[]> = {
  OPEN: ["CLOSING", "CANCELLED"],
  CLOSING: ["CLOSED", "OPEN"], // OPEN<-CLOSING only via manager reopen workflow
  CLOSED: [],
  CANCELLED: [],
};

export class InvalidVisitTransitionError extends Error {
  constructor(from: VisitStatus, to: VisitStatus) {
    super(`Visit cannot transition from ${from} to ${to}`);
    this.name = "InvalidVisitTransitionError";
  }
}

export function canTransitionVisit(from: VisitStatus, to: VisitStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertVisitTransition(from: VisitStatus, to: VisitStatus): void {
  if (!canTransitionVisit(from, to)) {
    throw new InvalidVisitTransitionError(from, to);
  }
}

export function isVisitOperable(visit: Visit): boolean {
  return visit.status === "OPEN" || visit.status === "CLOSING";
}
