import { randomUUID } from "node:crypto";
import type {
  BreakLogRepositoryPort,
  EmploymentRepositoryPort,
  ShiftAssignmentRepositoryPort,
  TimeAdjustmentRepositoryPort,
  TimeEntryRepositoryPort,
} from "./ports.js";
import {
  type TimeEntry,
  OpenTimeEntryConflictError,
  computeClockSkewMs,
  shouldFlagPendingReview,
  closeTimeEntry,
  applyApprovedTimeAdjustment,
} from "../domain/time-entry.js";
import {
  autoCloseBreakLogOnClockOut,
} from "../domain/break-log.js";
import {
  type TimeAdjustment,
  approveTimeAdjustment,
  rejectTimeAdjustment,
  assertTimeAdjustmentApprovalBase,
  StaleTimeAdjustmentApprovalError,
  validateTimeAdjustmentWindow,
} from "../domain/time-adjustment.js";
import {
  OPEN_BREAK_REQUIRES_RESOLUTION_REASON_CODE,
  shouldAutoCloseBreakOnClockOut,
} from "./break-policy.js";
import {
  isEmploymentActiveAt,
  isEmploymentEligibleForBranch,
} from "../domain/employment.js";

interface TimeTrackingDeps {
  employments: EmploymentRepositoryPort;
  shiftAssignments: ShiftAssignmentRepositoryPort;
  timeEntries: TimeEntryRepositoryPort;
  timeAdjustments: TimeAdjustmentRepositoryPort;
  breakLogs?: BreakLogRepositoryPort;
}

interface ClockInInput {
  tenantId: string;
  branchId: string;
  employmentId: string;
  shiftAssignmentId?: string | null;
  commandId?: string | null;
  capturedAt: Date;
  receivedAt: Date;
  timezone: string;
  source: TimeEntry["source"];
  deviceId: string;
  deviceSequence: number;
}

function resolveClockInReview(
  existingEntries: TimeEntry[],
  input: Pick<ClockInInput, "deviceId" | "deviceSequence" | "capturedAt" | "receivedAt">,
): { pendingReview: boolean; reviewReason?: string } {
  const clockSkewMs = computeClockSkewMs(input.capturedAt, input.receivedAt);
  if (shouldFlagPendingReview(clockSkewMs)) {
    return { pendingReview: true, reviewReason: "CLOCK_SKEW_OUT_OF_TOLERANCE" };
  }

  const lastDeviceEntry = existingEntries
    .filter((item) => item.deviceId === input.deviceId)
    .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())[0];
  if (lastDeviceEntry && input.deviceSequence <= lastDeviceEntry.deviceSequence) {
    return { pendingReview: true, reviewReason: "DEVICE_SEQUENCE_OUT_OF_ORDER" };
  }

  return { pendingReview: false };
}

export async function clockIn(
  deps: TimeTrackingDeps,
  input: ClockInInput,
): Promise<TimeEntry> {
  if (input.deviceSequence < 0) {
    throw new Error("deviceSequence must be non-negative");
  }
  const employment = await deps.employments.findById(input.tenantId, input.employmentId);
  if (!employment) throw new Error(`Employment ${input.employmentId} not found`);
  if (!isEmploymentActiveAt(employment, input.receivedAt)) {
    throw new Error(`Employment ${input.employmentId} is not active`);
  }
  if (!isEmploymentEligibleForBranch(employment, input.branchId)) {
    throw new Error(`Employment ${input.employmentId} is not eligible for branch ${input.branchId}`);
  }
  if (input.shiftAssignmentId) {
    const assignment = await deps.shiftAssignments.findById(input.tenantId, input.shiftAssignmentId);
    if (!assignment) throw new Error(`ShiftAssignment ${input.shiftAssignmentId} not found`);
    if (assignment.employmentId !== input.employmentId) {
      throw new Error(
        `ShiftAssignment ${input.shiftAssignmentId} does not belong to employment ${input.employmentId}`,
      );
    }
    if (assignment.branchId !== input.branchId) {
      throw new Error(
        `ShiftAssignment ${input.shiftAssignmentId} does not belong to branch ${input.branchId}`,
      );
    }
    if (assignment.status !== "CONFIRMED") {
      throw new Error(`ShiftAssignment ${input.shiftAssignmentId} must be CONFIRMED to clock-in`);
    }
  }
  if (input.commandId) {
    const existingEntries = await deps.timeEntries.listByEmployment(input.tenantId, input.employmentId);
    const replay = existingEntries.find((item) => item.openedCommandId === input.commandId);
    if (replay) return replay;
  }
  const existingEntries = await deps.timeEntries.listByEmployment(input.tenantId, input.employmentId);
  const existingOpen = await deps.timeEntries.findOpenByEmployment(input.tenantId, input.employmentId);
  if (existingOpen) throw new OpenTimeEntryConflictError(input.employmentId);

  const clockSkewMs = computeClockSkewMs(input.capturedAt, input.receivedAt);
  const review = resolveClockInReview(existingEntries, input);
  const entry: TimeEntry = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    employmentId: input.employmentId,
    ...(input.shiftAssignmentId ? { shiftAssignmentId: input.shiftAssignmentId } : {}),
    status: "OPEN",
    capturedAt: input.capturedAt,
    effectiveCapturedAt: input.capturedAt,
    receivedAt: input.receivedAt,
    timezone: input.timezone,
    source: input.source,
    deviceId: input.deviceId,
    deviceSequence: input.deviceSequence,
    ...(input.commandId ? { openedCommandId: input.commandId } : {}),
    clockSkewMs,
    pendingReview: review.pendingReview,
    ...(review.reviewReason ? { reviewReason: review.reviewReason } : {}),
    revision: 0,
    createdAt: input.receivedAt,
    updatedAt: input.receivedAt,
  };
  await deps.timeEntries.save(entry);
  return entry;
}

interface ClockOutInput {
  tenantId: string;
  employmentId: string;
  commandId?: string | null;
  capturedAt: Date;
  receivedAt: Date;
}

export class OpenBreakOnClockOutError extends Error {
  readonly reasonCode = OPEN_BREAK_REQUIRES_RESOLUTION_REASON_CODE;

  constructor(
    readonly timeEntryId: string,
    readonly breakLogId: string,
  ) {
    super(
      `TimeEntry ${timeEntryId} cannot clock-out while BreakLog ${breakLogId} remains OPEN`,
    );
    this.name = "OpenBreakOnClockOutError";
  }
}

export async function clockOut(
  deps: TimeTrackingDeps,
  input: ClockOutInput,
): Promise<TimeEntry> {
  const openEntry = await deps.timeEntries.findOpenByEmployment(input.tenantId, input.employmentId);
  if (!openEntry) {
    if (input.commandId) {
      const existingEntries = await deps.timeEntries.listByEmployment(input.tenantId, input.employmentId);
      const replay = existingEntries.find((item) => item.closedCommandId === input.commandId);
      if (replay) return replay;
    }
    throw new Error(`OPEN TimeEntry not found for employment ${input.employmentId}`);
  }
  if (deps.breakLogs) {
    const openBreak = await deps.breakLogs.findOpenByTimeEntry(input.tenantId, openEntry.id);
    if (openBreak) {
      if (!shouldAutoCloseBreakOnClockOut(openBreak.laborPolicyVersion)) {
        throw new OpenBreakOnClockOutError(openEntry.id, openBreak.id);
      }
      const autoClosedBreak = autoCloseBreakLogOnClockOut(openBreak, input.capturedAt);
      await deps.breakLogs.save(autoClosedBreak);
    }
  }
  const closed = closeTimeEntry(openEntry, input.capturedAt, input.receivedAt, input.commandId);
  await deps.timeEntries.save(closed);
  return closed;
}

interface RequestTimeAdjustmentInput {
  tenantId: string;
  timeEntryId: string;
  requesterId: string;
  commandId?: string | null;
  reason: string;
  requestedClockInAt?: Date | null;
  requestedClockOutAt?: Date | null;
  evidence?: string | null;
  now?: Date;
}

export async function requestTimeAdjustment(
  deps: TimeTrackingDeps,
  input: RequestTimeAdjustmentInput,
): Promise<TimeAdjustment> {
  const now = input.now ?? new Date();
  const entry = await deps.timeEntries.findById(input.tenantId, input.timeEntryId);
  if (!entry) throw new Error(`TimeEntry ${input.timeEntryId} not found`);
  if (input.commandId) {
    const existingAdjustments = await deps.timeAdjustments.listByTimeEntry(input.tenantId, input.timeEntryId);
    const replay = existingAdjustments.find((item) => item.requestCommandId === input.commandId);
    if (replay) return replay;
  }
  const beforeClockInAt = entry.effectiveCapturedAt ?? entry.capturedAt;
  const beforeClockOutAt = entry.effectiveClosedCapturedAt ?? entry.closedCapturedAt ?? null;
  const afterClockInAt = input.requestedClockInAt ?? beforeClockInAt;
  const afterClockOutAt = input.requestedClockOutAt ?? beforeClockOutAt;
  const adjustment: TimeAdjustment = {
    id: randomUUID(),
    tenantId: input.tenantId,
    timeEntryId: input.timeEntryId,
    ...(input.commandId ? { requestCommandId: input.commandId } : {}),
    beforeClockInAt,
    beforeClockOutAt,
    ...(input.requestedClockInAt ? { requestedClockInAt: input.requestedClockInAt } : {}),
    ...(input.requestedClockOutAt ? { requestedClockOutAt: input.requestedClockOutAt } : {}),
    ...(afterClockInAt ? { afterClockInAt } : {}),
    ...(afterClockOutAt ? { afterClockOutAt } : { afterClockOutAt: null }),
    reason: input.reason,
    ...(input.evidence ? { evidence: input.evidence } : {}),
    requesterId: input.requesterId,
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  };
  validateTimeAdjustmentWindow({
    beforeClockInAt,
    beforeClockOutAt,
    afterClockInAt,
    afterClockOutAt,
  });
  await deps.timeAdjustments.save(adjustment);
  return adjustment;
}

export async function approveRequestedTimeAdjustment(
  deps: TimeTrackingDeps,
  tenantId: string,
  adjustmentId: string,
  approverId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<TimeAdjustment> {
  const adjustment = await deps.timeAdjustments.findById(tenantId, adjustmentId);
  if (!adjustment) throw new Error(`TimeAdjustment ${adjustmentId} not found`);
  if (commandId && adjustment.decisionCommandId === commandId) {
    return adjustment;
  }
  const entry = await deps.timeEntries.findById(tenantId, adjustment.timeEntryId);
  if (!entry) throw new Error(`TimeEntry ${adjustment.timeEntryId} not found`);
  assertTimeAdjustmentApprovalBase(adjustment, {
    effectiveClockInAt: entry.effectiveCapturedAt ?? entry.capturedAt,
    effectiveClockOutAt: entry.effectiveClosedCapturedAt ?? entry.closedCapturedAt ?? null,
  });
  const approved = approveTimeAdjustment(
    { ...adjustment, ...(commandId ? { decisionCommandId: commandId } : {}) },
    approverId,
    now,
  );
  const updatedEntry = applyApprovedTimeAdjustment(entry, {
    adjustmentId: approved.id,
    ...(approved.afterClockInAt !== undefined ? { effectiveClockInAt: approved.afterClockInAt } : {}),
    ...(approved.afterClockOutAt !== undefined ? { effectiveClockOutAt: approved.afterClockOutAt } : {}),
    appliedAt: now,
  });
  await deps.timeEntries.save(updatedEntry);
  await deps.timeAdjustments.save(approved);
  return approved;
}

export async function rejectRequestedTimeAdjustment(
  deps: TimeTrackingDeps,
  tenantId: string,
  adjustmentId: string,
  approverId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<TimeAdjustment> {
  const adjustment = await deps.timeAdjustments.findById(tenantId, adjustmentId);
  if (!adjustment) throw new Error(`TimeAdjustment ${adjustmentId} not found`);
  if (commandId && adjustment.decisionCommandId === commandId) {
    return adjustment;
  }
  const rejected = rejectTimeAdjustment(
    { ...adjustment, ...(commandId ? { decisionCommandId: commandId } : {}) },
    approverId,
    now,
  );
  await deps.timeAdjustments.save(rejected);
  return rejected;
}
