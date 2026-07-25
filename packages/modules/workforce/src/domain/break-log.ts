import { AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE } from "../application/break-policy.js";

export type BreakLogStatus = "OPEN" | "CLOSED";
export type BreakLogSource = "DEVICE" | "MANUAL" | "IMPORT";
export type BreakType = "MEAL" | "REST" | "OTHER";
export type BreakPaidClassification = "PAID" | "UNPAID";
export type BreakFindingReasonCode =
  | "AUTO_CLOSED_ON_CLOCK_OUT"
  | "OPEN_BREAK_REQUIRES_RESOLUTION";

export interface BreakLog {
  id: string;
  tenantId: string;
  timeEntryId: string;
  breakType: BreakType;
  paidClassification: BreakPaidClassification;
  laborPolicyVersion: string;
  status: BreakLogStatus;
  openedAt: Date;
  effectiveOpenedAt?: Date | null;
  closedAt?: Date | null;
  effectiveClosedAt?: Date | null;
  timezone: string;
  source: BreakLogSource;
  deviceId: string;
  deviceSequence: number;
  openedCommandId?: string | null;
  closedCommandId?: string | null;
  findingReasonCode?: BreakFindingReasonCode | null;
  lastApprovedAdjustmentId?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OpenBreakConflictError extends Error {
  constructor(timeEntryId: string) {
    super(`TimeEntry ${timeEntryId} already has an OPEN BreakLog`);
    this.name = "OpenBreakConflictError";
  }
}

export class InvalidBreakTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBreakTransitionError";
  }
}

export function closeBreakLog(
  breakLog: BreakLog,
  closedAt: Date,
  closedCommandId?: string | null,
): BreakLog {
  if (breakLog.status !== "OPEN") {
    throw new InvalidBreakTransitionError("BreakLog must be OPEN to end break");
  }
  if (closedAt.getTime() < breakLog.openedAt.getTime()) {
    throw new InvalidBreakTransitionError("Break closedAt cannot be earlier than openedAt");
  }
  return {
    ...breakLog,
    status: "CLOSED",
    closedAt,
    ...(closedCommandId !== undefined ? { closedCommandId } : {}),
    ...(breakLog.effectiveClosedAt !== undefined
      ? { effectiveClosedAt: breakLog.effectiveClosedAt }
      : { effectiveClosedAt: closedAt }),
    revision: breakLog.revision + 1,
    updatedAt: closedAt,
  };
}

export function autoCloseBreakLogOnClockOut(
  breakLog: BreakLog,
  closedAt: Date,
  findingReasonCode: BreakFindingReasonCode = AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE,
): BreakLog {
  const closed = closeBreakLog(breakLog, closedAt);
  return {
    ...closed,
    findingReasonCode,
  };
}

export function applyApprovedBreakAdjustment(
  breakLog: BreakLog,
  input: {
    adjustmentId: string;
    effectiveOpenedAt?: Date | null;
    effectiveClosedAt?: Date | null;
    appliedAt: Date;
  },
): BreakLog {
  return {
    ...breakLog,
    ...(input.effectiveOpenedAt !== undefined ? { effectiveOpenedAt: input.effectiveOpenedAt } : {}),
    ...(input.effectiveClosedAt !== undefined ? { effectiveClosedAt: input.effectiveClosedAt } : {}),
    lastApprovedAdjustmentId: input.adjustmentId,
    revision: breakLog.revision + 1,
    updatedAt: input.appliedAt,
  };
}
