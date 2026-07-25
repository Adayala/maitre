export type BreakAdjustmentStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface BreakAdjustment {
  id: string;
  tenantId: string;
  breakLogId: string;
  requestCommandId?: string | null;
  decisionCommandId?: string | null;
  beforeOpenedAt?: Date | null;
  beforeClosedAt?: Date | null;
  requestedOpenedAt?: Date | null;
  requestedClosedAt?: Date | null;
  afterOpenedAt?: Date | null;
  afterClosedAt?: Date | null;
  reason: string;
  evidence?: string | null;
  requesterId: string;
  approverId?: string | null;
  status: BreakAdjustmentStatus;
  effectiveAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidBreakAdjustmentTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBreakAdjustmentTransitionError";
  }
}

export class SelfBreakApprovalNotAllowedError extends Error {
  constructor() {
    super("Requester cannot approve their own BreakAdjustment");
    this.name = "SelfBreakApprovalNotAllowedError";
  }
}

export class InvalidBreakAdjustmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBreakAdjustmentError";
  }
}

export class StaleBreakAdjustmentApprovalError extends Error {
  constructor() {
    super("BreakAdjustment approval base is stale and must be requested again");
    this.name = "StaleBreakAdjustmentApprovalError";
  }
}

export function validateBreakAdjustmentWindow(input: {
  beforeOpenedAt?: Date | null | undefined;
  beforeClosedAt?: Date | null | undefined;
  afterOpenedAt?: Date | null | undefined;
  afterClosedAt?: Date | null | undefined;
}): void {
  const beforeOpenedAt = input.beforeOpenedAt ?? null;
  const beforeClosedAt = input.beforeClosedAt ?? null;
  const afterOpenedAt = input.afterOpenedAt ?? null;
  const afterClosedAt = input.afterClosedAt ?? null;

  if (afterOpenedAt && afterClosedAt && afterClosedAt.getTime() < afterOpenedAt.getTime()) {
    throw new InvalidBreakAdjustmentError("Adjusted break close cannot be earlier than adjusted break open");
  }

  if (
    beforeOpenedAt?.getTime() === afterOpenedAt?.getTime() &&
    beforeClosedAt?.getTime() === afterClosedAt?.getTime()
  ) {
    throw new InvalidBreakAdjustmentError("BreakAdjustment must change at least one effective timestamp");
  }
}

export function assertBreakAdjustmentApprovalBase(
  adjustment: Pick<BreakAdjustment, "beforeOpenedAt" | "beforeClosedAt">,
  current: {
    effectiveOpenedAt?: Date | null | undefined;
    effectiveClosedAt?: Date | null | undefined;
  },
): void {
  const beforeOpenedAt = adjustment.beforeOpenedAt ?? null;
  const beforeClosedAt = adjustment.beforeClosedAt ?? null;
  const effectiveOpenedAt = current.effectiveOpenedAt ?? null;
  const effectiveClosedAt = current.effectiveClosedAt ?? null;

  if (
    beforeOpenedAt?.getTime() !== effectiveOpenedAt?.getTime() ||
    beforeClosedAt?.getTime() !== effectiveClosedAt?.getTime()
  ) {
    throw new StaleBreakAdjustmentApprovalError();
  }
}

export function approveBreakAdjustment(
  adjustment: BreakAdjustment,
  approverId: string,
  effectiveAt: Date,
): BreakAdjustment {
  if (adjustment.status !== "REQUESTED") {
    throw new InvalidBreakAdjustmentTransitionError("Only REQUESTED adjustments can be approved");
  }
  if (adjustment.requesterId === approverId) {
    throw new SelfBreakApprovalNotAllowedError();
  }
  validateBreakAdjustmentWindow({
    beforeOpenedAt: adjustment.beforeOpenedAt,
    beforeClosedAt: adjustment.beforeClosedAt,
    afterOpenedAt: adjustment.afterOpenedAt,
    afterClosedAt: adjustment.afterClosedAt,
  });
  return {
    ...adjustment,
    status: "APPROVED",
    approverId,
    effectiveAt,
    updatedAt: effectiveAt,
  };
}

export function rejectBreakAdjustment(
  adjustment: BreakAdjustment,
  approverId: string,
  effectiveAt: Date,
): BreakAdjustment {
  if (adjustment.status !== "REQUESTED") {
    throw new InvalidBreakAdjustmentTransitionError("Only REQUESTED adjustments can be rejected");
  }
  if (adjustment.requesterId === approverId) {
    throw new SelfBreakApprovalNotAllowedError();
  }
  return {
    ...adjustment,
    status: "REJECTED",
    approverId,
    effectiveAt,
    updatedAt: effectiveAt,
  };
}
