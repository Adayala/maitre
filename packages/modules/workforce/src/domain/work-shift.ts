export type WorkShiftStatus = "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface WorkShift {
  id: string;
  tenantId: string;
  branchId: string;
  timezone: string;
  businessDate: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
  laborPolicyVersion: string;
  servicePeriodId?: string | null;
  status: WorkShiftStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
}

const allowedTransitions: Record<WorkShiftStatus, WorkShiftStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class InvalidWorkShiftTransitionError extends Error {
  constructor(from: WorkShiftStatus, to: WorkShiftStatus) {
    super(`WorkShift cannot transition from ${from} to ${to}`);
    this.name = "InvalidWorkShiftTransitionError";
  }
}

export class InvalidWorkShiftIntervalError extends Error {
  constructor() {
    super("WorkShift startsAtUtc must be earlier than endsAtUtc");
    this.name = "InvalidWorkShiftIntervalError";
  }
}

export class ActiveWorkShiftConflictError extends Error {
  constructor(branchId: string) {
    super(`Branch ${branchId} already has an incompatible active WorkShift`);
    this.name = "ActiveWorkShiftConflictError";
  }
}

export function assertWorkShiftInterval(startsAtUtc: Date, endsAtUtc: Date): void {
  if (startsAtUtc.getTime() >= endsAtUtc.getTime()) {
    throw new InvalidWorkShiftIntervalError();
  }
}

export function canTransitionWorkShift(from: WorkShiftStatus, to: WorkShiftStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionWorkShift(
  shift: WorkShift,
  to: WorkShiftStatus,
  now: Date,
): WorkShift {
  if (!canTransitionWorkShift(shift.status, to)) {
    throw new InvalidWorkShiftTransitionError(shift.status, to);
  }

  return {
    ...shift,
    status: to,
    revision: shift.revision + 1,
    updatedAt: now,
    ...(to === "PUBLISHED" ? { publishedAt: now } : shift.publishedAt !== undefined ? { publishedAt: shift.publishedAt } : {}),
    ...(to === "IN_PROGRESS" ? { startedAt: now } : shift.startedAt !== undefined ? { startedAt: shift.startedAt } : {}),
    ...(to === "COMPLETED" ? { completedAt: now } : shift.completedAt !== undefined ? { completedAt: shift.completedAt } : {}),
    ...(to === "CANCELLED" ? { cancelledAt: now } : shift.cancelledAt !== undefined ? { cancelledAt: shift.cancelledAt } : {}),
  };
}
