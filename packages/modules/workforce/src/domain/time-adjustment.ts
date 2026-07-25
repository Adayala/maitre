export type TimeAdjustmentStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface TimeAdjustment {
  id: string;
  tenantId: string;
  timeEntryId: string;
  requestCommandId?: string | null;
  decisionCommandId?: string | null;
  beforeClockInAt?: Date | null;
  beforeClockOutAt?: Date | null;
  requestedClockInAt?: Date | null;
  requestedClockOutAt?: Date | null;
  afterClockInAt?: Date | null;
  afterClockOutAt?: Date | null;
  reason: string;
  evidence?: string | null;
  requesterId: string;
  approverId?: string | null;
  status: TimeAdjustmentStatus;
  effectiveAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidTimeAdjustmentTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimeAdjustmentTransitionError";
  }
}

export class SelfApprovalNotAllowedError extends Error {
  constructor() {
    super("Requester cannot approve their own TimeAdjustment");
    this.name = "SelfApprovalNotAllowedError";
  }
}

export class InvalidTimeAdjustmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimeAdjustmentError";
  }
}

export class StaleTimeAdjustmentApprovalError extends Error {
  constructor() {
    super("TimeAdjustment approval base is stale and must be requested again");
    this.name = "StaleTimeAdjustmentApprovalError";
  }
}

export function validateTimeAdjustmentWindow(input: {
  beforeClockInAt?: Date | null | undefined;
  beforeClockOutAt?: Date | null | undefined;
  afterClockInAt?: Date | null | undefined;
  afterClockOutAt?: Date | null | undefined;
}): void {
  const beforeClockInAt = input.beforeClockInAt ?? null;
  const beforeClockOutAt = input.beforeClockOutAt ?? null;
  const afterClockInAt = input.afterClockInAt ?? null;
  const afterClockOutAt = input.afterClockOutAt ?? null;

  if (afterClockInAt && afterClockOutAt && afterClockOutAt.getTime() < afterClockInAt.getTime()) {
    throw new InvalidTimeAdjustmentError("Adjusted clock-out cannot be earlier than adjusted clock-in");
  }

  if (
    beforeClockInAt?.getTime() === afterClockInAt?.getTime() &&
    beforeClockOutAt?.getTime() === afterClockOutAt?.getTime()
  ) {
    throw new InvalidTimeAdjustmentError("TimeAdjustment must change at least one effective timestamp");
  }
}

export function assertTimeAdjustmentApprovalBase(
  adjustment: Pick<TimeAdjustment, "beforeClockInAt" | "beforeClockOutAt">,
  current: {
    effectiveClockInAt?: Date | null | undefined;
    effectiveClockOutAt?: Date | null | undefined;
  },
): void {
  const beforeClockInAt = adjustment.beforeClockInAt ?? null;
  const beforeClockOutAt = adjustment.beforeClockOutAt ?? null;
  const effectiveClockInAt = current.effectiveClockInAt ?? null;
  const effectiveClockOutAt = current.effectiveClockOutAt ?? null;

  if (
    beforeClockInAt?.getTime() !== effectiveClockInAt?.getTime() ||
    beforeClockOutAt?.getTime() !== effectiveClockOutAt?.getTime()
  ) {
    throw new StaleTimeAdjustmentApprovalError();
  }
}

export function approveTimeAdjustment(
  adjustment: TimeAdjustment,
  approverId: string,
  effectiveAt: Date,
): TimeAdjustment {
  if (adjustment.status !== "REQUESTED") {
    throw new InvalidTimeAdjustmentTransitionError("Only REQUESTED adjustments can be approved");
  }
  if (adjustment.requesterId === approverId) {
    throw new SelfApprovalNotAllowedError();
  }
  validateTimeAdjustmentWindow({
    beforeClockInAt: adjustment.beforeClockInAt,
    beforeClockOutAt: adjustment.beforeClockOutAt,
    afterClockInAt: adjustment.afterClockInAt,
    afterClockOutAt: adjustment.afterClockOutAt,
  });
  return {
    ...adjustment,
    status: "APPROVED",
    approverId,
    ...(adjustment.decisionCommandId !== undefined ? { decisionCommandId: adjustment.decisionCommandId } : {}),
    effectiveAt,
    updatedAt: effectiveAt,
  };
}

export function rejectTimeAdjustment(
  adjustment: TimeAdjustment,
  approverId: string,
  effectiveAt: Date,
): TimeAdjustment {
  if (adjustment.status !== "REQUESTED") {
    throw new InvalidTimeAdjustmentTransitionError("Only REQUESTED adjustments can be rejected");
  }
  if (adjustment.requesterId === approverId) {
    throw new SelfApprovalNotAllowedError();
  }
  return {
    ...adjustment,
    status: "REJECTED",
    approverId,
    ...(adjustment.decisionCommandId !== undefined ? { decisionCommandId: adjustment.decisionCommandId } : {}),
    effectiveAt,
    updatedAt: effectiveAt,
  };
}
