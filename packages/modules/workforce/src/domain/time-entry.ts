export type TimeEntryStatus = "OPEN" | "CLOSED";
export type TimeEntrySource = "DEVICE" | "MANUAL" | "IMPORT";

export interface TimeEntry {
  id: string;
  tenantId: string;
  branchId: string;
  employmentId: string;
  shiftAssignmentId?: string | null;
  status: TimeEntryStatus;
  capturedAt: Date;
  effectiveCapturedAt?: Date | null;
  receivedAt: Date;
  closedCapturedAt?: Date | null;
  effectiveClosedCapturedAt?: Date | null;
  closedReceivedAt?: Date | null;
  timezone: string;
  source: TimeEntrySource;
  deviceId: string;
  deviceSequence: number;
  openedCommandId?: string | null;
  closedCommandId?: string | null;
  clockSkewMs: number;
  pendingReview: boolean;
  reviewReason?: string | null;
  lastApprovedAdjustmentId?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OpenTimeEntryConflictError extends Error {
  constructor(employmentId: string) {
    super(`Employment ${employmentId} already has an OPEN TimeEntry`);
    this.name = "OpenTimeEntryConflictError";
  }
}

export class InvalidTimeEntryTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimeEntryTransitionError";
  }
}

export function computeClockSkewMs(capturedAt: Date, receivedAt: Date): number {
  return receivedAt.getTime() - capturedAt.getTime();
}

export function shouldFlagPendingReview(clockSkewMs: number, maxAbsSkewMs = 10 * 60 * 1000): boolean {
  return Math.abs(clockSkewMs) > maxAbsSkewMs;
}

export function closeTimeEntry(
  entry: TimeEntry,
  closedCapturedAt: Date,
  closedReceivedAt: Date,
  closedCommandId?: string | null,
): TimeEntry {
  if (entry.status !== "OPEN") {
    throw new InvalidTimeEntryTransitionError("TimeEntry must be OPEN to clock-out");
  }
  if (closedCapturedAt.getTime() < entry.capturedAt.getTime()) {
    throw new InvalidTimeEntryTransitionError("closedCapturedAt cannot be earlier than capturedAt");
  }
  if (closedReceivedAt.getTime() < entry.receivedAt.getTime()) {
    throw new InvalidTimeEntryTransitionError("closedReceivedAt cannot be earlier than receivedAt");
  }
  return {
    ...entry,
    status: "CLOSED",
    closedCapturedAt,
    ...(entry.effectiveClosedCapturedAt !== undefined
      ? { effectiveClosedCapturedAt: entry.effectiveClosedCapturedAt }
      : { effectiveClosedCapturedAt: closedCapturedAt }),
    closedReceivedAt,
    ...(closedCommandId !== undefined ? { closedCommandId } : {}),
    revision: entry.revision + 1,
    updatedAt: closedReceivedAt,
  };
}

export function applyApprovedTimeAdjustment(
  entry: TimeEntry,
  input: {
    adjustmentId: string;
    effectiveClockInAt?: Date | null;
    effectiveClockOutAt?: Date | null;
    appliedAt: Date;
  },
): TimeEntry {
  return {
    ...entry,
    ...(input.effectiveClockInAt !== undefined
      ? { effectiveCapturedAt: input.effectiveClockInAt }
      : {}),
    ...(input.effectiveClockOutAt !== undefined
      ? { effectiveClosedCapturedAt: input.effectiveClockOutAt }
      : {}),
    pendingReview: false,
    reviewReason: null,
    lastApprovedAdjustmentId: input.adjustmentId,
    revision: entry.revision + 1,
    updatedAt: input.appliedAt,
  };
}
