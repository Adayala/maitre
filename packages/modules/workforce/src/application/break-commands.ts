import { randomUUID } from "node:crypto";
import type { BreakLog } from "../domain/break-log.js";
import {
  closeBreakLog,
  OpenBreakConflictError,
  applyApprovedBreakAdjustment,
  InvalidBreakTransitionError,
} from "../domain/break-log.js";
import type {
  BreakAdjustmentRepositoryPort,
  BreakLogRepositoryPort,
  TimeEntryRepositoryPort,
} from "./ports.js";
import {
  type BreakAdjustment,
  assertBreakAdjustmentApprovalBase,
  approveBreakAdjustment,
  rejectBreakAdjustment,
  StaleBreakAdjustmentApprovalError,
  validateBreakAdjustmentWindow,
} from "../domain/break-adjustment.js";

interface BreakDeps {
  timeEntries: TimeEntryRepositoryPort;
  breakLogs: BreakLogRepositoryPort;
  breakAdjustments?: BreakAdjustmentRepositoryPort;
}

interface StartBreakInput {
  tenantId: string;
  timeEntryId: string;
  breakType: BreakLog["breakType"];
  paidClassification: BreakLog["paidClassification"];
  laborPolicyVersion: string;
  openedAt: Date;
  timezone: string;
  source: BreakLog["source"];
  deviceId: string;
  deviceSequence: number;
  commandId?: string | null;
}

export async function startBreak(
  deps: BreakDeps,
  input: StartBreakInput,
): Promise<BreakLog> {
  if (input.deviceSequence < 0) {
    throw new Error("deviceSequence must be non-negative");
  }

  const entry = await deps.timeEntries.findById(input.tenantId, input.timeEntryId);
  if (!entry) throw new Error(`TimeEntry ${input.timeEntryId} not found`);
  if (entry.status !== "OPEN") throw new Error(`TimeEntry ${input.timeEntryId} must be OPEN`);
  const entryOpenedAt = entry.effectiveCapturedAt ?? entry.capturedAt;
  if (input.openedAt.getTime() < entryOpenedAt.getTime()) {
    throw new InvalidBreakTransitionError("Break openedAt cannot be earlier than time entry capturedAt");
  }

  if (input.commandId) {
    const existingLogs = await deps.breakLogs.listByTimeEntry(input.tenantId, input.timeEntryId);
    const replay = existingLogs.find((item) => item.openedCommandId === input.commandId);
    if (replay) return replay;
  }

  const existingOpen = await deps.breakLogs.findOpenByTimeEntry(input.tenantId, input.timeEntryId);
  if (existingOpen) throw new OpenBreakConflictError(input.timeEntryId);

  const breakLog: BreakLog = {
    id: randomUUID(),
    tenantId: input.tenantId,
    timeEntryId: input.timeEntryId,
    breakType: input.breakType,
    paidClassification: input.paidClassification,
    laborPolicyVersion: input.laborPolicyVersion,
    status: "OPEN",
    openedAt: input.openedAt,
    effectiveOpenedAt: input.openedAt,
    timezone: input.timezone,
    source: input.source,
    deviceId: input.deviceId,
    deviceSequence: input.deviceSequence,
    ...(input.commandId ? { openedCommandId: input.commandId } : {}),
    revision: 0,
    createdAt: input.openedAt,
    updatedAt: input.openedAt,
  };
  await deps.breakLogs.save(breakLog);
  return breakLog;
}

interface EndBreakInput {
  tenantId: string;
  breakLogId: string;
  expectedRevision: number;
  closedAt: Date;
  commandId?: string | null;
}

export class BreakRevisionConflictError extends Error {
  constructor(
    readonly breakLogId: string,
    readonly expectedRevision: number,
    readonly actualRevision: number,
  ) {
    super(
      `BreakLog ${breakLogId} revision mismatch: expected ${expectedRevision}, actual ${actualRevision}`,
    );
    this.name = "BreakRevisionConflictError";
  }
}

export async function endBreak(
  deps: BreakDeps,
  input: EndBreakInput,
): Promise<BreakLog> {
  const breakLog = await deps.breakLogs.findById(input.tenantId, input.breakLogId);
  if (!breakLog) throw new Error(`BreakLog ${input.breakLogId} not found`);
  if (input.commandId && breakLog.closedCommandId === input.commandId) {
    return breakLog;
  }
  if (breakLog.revision !== input.expectedRevision) {
    throw new BreakRevisionConflictError(
      breakLog.id,
      input.expectedRevision,
      breakLog.revision,
    );
  }
  if (breakLog.status !== "OPEN") {
    throw new InvalidBreakTransitionError("BreakLog must be OPEN to end break");
  }
  const closed = closeBreakLog(breakLog, input.closedAt, input.commandId);
  await deps.breakLogs.save(closed);
  return closed;
}

interface RequestBreakAdjustmentInput {
  tenantId: string;
  breakLogId: string;
  requesterId: string;
  commandId?: string | null;
  reason: string;
  requestedOpenedAt?: Date | null;
  requestedClosedAt?: Date | null;
  evidence?: string | null;
  now?: Date;
}

export async function requestBreakAdjustment(
  deps: Required<Pick<BreakDeps, "breakLogs" | "breakAdjustments">>,
  input: RequestBreakAdjustmentInput,
): Promise<BreakAdjustment> {
  const now = input.now ?? new Date();
  const breakLog = await deps.breakLogs.findById(input.tenantId, input.breakLogId);
  if (!breakLog) throw new Error(`BreakLog ${input.breakLogId} not found`);
  if (input.commandId) {
    const existingAdjustments = await deps.breakAdjustments.listByBreakLog(input.tenantId, input.breakLogId);
    const replay = existingAdjustments.find((item) => item.requestCommandId === input.commandId);
    if (replay) return replay;
  }
  const beforeOpenedAt = breakLog.effectiveOpenedAt ?? breakLog.openedAt;
  const beforeClosedAt = breakLog.effectiveClosedAt ?? breakLog.closedAt ?? null;
  const afterOpenedAt = input.requestedOpenedAt ?? beforeOpenedAt;
  const afterClosedAt = input.requestedClosedAt ?? beforeClosedAt;
  const adjustment: BreakAdjustment = {
    id: randomUUID(),
    tenantId: input.tenantId,
    breakLogId: input.breakLogId,
    ...(input.commandId ? { requestCommandId: input.commandId } : {}),
    beforeOpenedAt,
    beforeClosedAt,
    ...(input.requestedOpenedAt ? { requestedOpenedAt: input.requestedOpenedAt } : {}),
    ...(input.requestedClosedAt ? { requestedClosedAt: input.requestedClosedAt } : {}),
    ...(afterOpenedAt ? { afterOpenedAt } : {}),
    ...(afterClosedAt ? { afterClosedAt } : { afterClosedAt: null }),
    reason: input.reason,
    ...(input.evidence ? { evidence: input.evidence } : {}),
    requesterId: input.requesterId,
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  };
  validateBreakAdjustmentWindow({
    beforeOpenedAt,
    beforeClosedAt,
    afterOpenedAt,
    afterClosedAt,
  });
  await deps.breakAdjustments.save(adjustment);
  return adjustment;
}

export async function approveRequestedBreakAdjustment(
  deps: Required<Pick<BreakDeps, "breakLogs" | "breakAdjustments">>,
  tenantId: string,
  adjustmentId: string,
  approverId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<BreakAdjustment> {
  const adjustment = await deps.breakAdjustments.findById(tenantId, adjustmentId);
  if (!adjustment) throw new Error(`BreakAdjustment ${adjustmentId} not found`);
  if (commandId && adjustment.decisionCommandId === commandId) {
    return adjustment;
  }
  const breakLog = await deps.breakLogs.findById(tenantId, adjustment.breakLogId);
  if (!breakLog) throw new Error(`BreakLog ${adjustment.breakLogId} not found`);
  assertBreakAdjustmentApprovalBase(adjustment, {
    effectiveOpenedAt: breakLog.effectiveOpenedAt ?? breakLog.openedAt,
    effectiveClosedAt: breakLog.effectiveClosedAt ?? breakLog.closedAt ?? null,
  });
  const approved = approveBreakAdjustment(
    { ...adjustment, ...(commandId ? { decisionCommandId: commandId } : {}) },
    approverId,
    now,
  );
  const updatedBreakLog = applyApprovedBreakAdjustment(breakLog, {
    adjustmentId: approved.id,
    ...(approved.afterOpenedAt !== undefined ? { effectiveOpenedAt: approved.afterOpenedAt } : {}),
    ...(approved.afterClosedAt !== undefined ? { effectiveClosedAt: approved.afterClosedAt } : {}),
    appliedAt: now,
  });
  await deps.breakLogs.save(updatedBreakLog);
  await deps.breakAdjustments.save(approved);
  return approved;
}

export async function rejectRequestedBreakAdjustment(
  deps: Required<Pick<BreakDeps, "breakLogs" | "breakAdjustments">>,
  tenantId: string,
  adjustmentId: string,
  approverId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<BreakAdjustment> {
  const adjustment = await deps.breakAdjustments.findById(tenantId, adjustmentId);
  if (!adjustment) throw new Error(`BreakAdjustment ${adjustmentId} not found`);
  if (commandId && adjustment.decisionCommandId === commandId) {
    return adjustment;
  }
  const rejected = rejectBreakAdjustment(
    { ...adjustment, ...(commandId ? { decisionCommandId: commandId } : {}) },
    approverId,
    now,
  );
  await deps.breakAdjustments.save(rejected);
  return rejected;
}
