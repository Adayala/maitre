export type ShiftAssignmentStatus = "PROPOSED" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export interface ShiftAssignment {
  id: string;
  tenantId: string;
  branchId: string;
  workShiftId: string;
  employmentId: string;
  roleCode: string;
  stationId?: string | null;
  createCommandId?: string | null;
  decisionCommandId?: string | null;
  status: ShiftAssignmentStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date | null;
  declinedAt?: Date | null;
  cancelledAt?: Date | null;
}

const allowedTransitions: Record<ShiftAssignmentStatus, ShiftAssignmentStatus[]> = {
  PROPOSED: ["CONFIRMED", "DECLINED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  DECLINED: [],
  CANCELLED: [],
};

export class InvalidShiftAssignmentTransitionError extends Error {
  constructor(from: ShiftAssignmentStatus, to: ShiftAssignmentStatus) {
    super(`ShiftAssignment cannot transition from ${from} to ${to}`);
    this.name = "InvalidShiftAssignmentTransitionError";
  }
}

export class DuplicateShiftAssignmentError extends Error {
  constructor(workShiftId: string, employmentId: string) {
    super(`ShiftAssignment already exists for shift ${workShiftId} and employment ${employmentId}`);
    this.name = "DuplicateShiftAssignmentError";
  }
}

export function transitionShiftAssignment(
  assignment: ShiftAssignment,
  to: ShiftAssignmentStatus,
  now: Date,
  decisionCommandId?: string | null,
): ShiftAssignment {
  if (!allowedTransitions[assignment.status].includes(to)) {
    throw new InvalidShiftAssignmentTransitionError(assignment.status, to);
  }
  return {
    ...assignment,
    status: to,
    revision: assignment.revision + 1,
    updatedAt: now,
    ...(decisionCommandId ? { decisionCommandId } : assignment.decisionCommandId !== undefined ? { decisionCommandId: assignment.decisionCommandId } : {}),
    ...(to === "CONFIRMED" ? { confirmedAt: now } : assignment.confirmedAt !== undefined ? { confirmedAt: assignment.confirmedAt } : {}),
    ...(to === "DECLINED" ? { declinedAt: now } : assignment.declinedAt !== undefined ? { declinedAt: assignment.declinedAt } : {}),
    ...(to === "CANCELLED" ? { cancelledAt: now } : assignment.cancelledAt !== undefined ? { cancelledAt: assignment.cancelledAt } : {}),
  };
}
