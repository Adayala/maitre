import { randomUUID } from "node:crypto";
import type { OutboxPort } from "@maitre/organization";
import type {
  EmploymentRepositoryPort,
  ShiftAssignmentRepositoryPort,
  WorkShiftRepositoryPort,
} from "./ports.js";
import {
  type ShiftAssignment,
  DuplicateShiftAssignmentError,
  transitionShiftAssignment,
} from "../domain/shift-assignment.js";
import {
  isEmploymentActiveAt,
  isEmploymentEligibleForBranch,
} from "../domain/employment.js";
import {
  shiftAssignmentCancelledEvent,
  shiftAssignmentConfirmedEvent,
  shiftAssignmentCreatedEvent,
  shiftAssignmentDeclinedEvent,
} from "./events.js";

interface ShiftAssignmentDeps {
  employments: EmploymentRepositoryPort;
  workShifts: WorkShiftRepositoryPort;
  shiftAssignments: ShiftAssignmentRepositoryPort;
  outbox?: OutboxPort;
}

interface CreateShiftAssignmentInput {
  tenantId: string;
  workShiftId: string;
  employmentId: string;
  roleCode: string;
  stationId?: string | null;
  commandId?: string | null;
  now?: Date;
}

interface ReassignShiftAssignmentInput {
  tenantId: string;
  assignmentId: string;
  employmentId: string;
  roleCode: string;
  stationId?: string | null;
  reason: string;
  confirmNewAssignment?: boolean;
  commandId?: string | null;
  now?: Date;
}

async function validateShiftAssignmentTarget(
  deps: ShiftAssignmentDeps,
  input: { tenantId: string; workShiftId: string; employmentId: string },
): Promise<void> {
  const shift = await deps.workShifts.findById(input.tenantId, input.workShiftId);
  if (!shift) throw new Error(`WorkShift ${input.workShiftId} not found`);
  if (shift.status === "CANCELLED" || shift.status === "COMPLETED") {
    throw new Error(`WorkShift ${shift.id} is not assignable in status ${shift.status}`);
  }
  const employment = await deps.employments.findById(input.tenantId, input.employmentId);
  if (!employment) throw new Error(`Employment ${input.employmentId} not found`);
  if (!isEmploymentActiveAt(employment, shift.startsAtUtc)) {
    throw new Error(`Employment ${employment.id} is not active for shift start`);
  }
  if (!isEmploymentEligibleForBranch(employment, shift.branchId)) {
    throw new Error(`Employment ${employment.id} is not eligible for branch ${shift.branchId}`);
  }
  const existing = await deps.shiftAssignments.findByShiftAndEmployment(
    input.tenantId,
    input.workShiftId,
    input.employmentId,
  );
  if (existing && existing.status !== "DECLINED" && existing.status !== "CANCELLED") {
    throw new DuplicateShiftAssignmentError(input.workShiftId, input.employmentId);
  }
}

export async function createShiftAssignment(
  deps: ShiftAssignmentDeps,
  input: CreateShiftAssignmentInput,
): Promise<ShiftAssignment> {
  const now = input.now ?? new Date();
  if (input.commandId) {
    const existingAssignments = await deps.shiftAssignments.listByShift(input.tenantId, input.workShiftId);
    const replay = existingAssignments.find((item) => item.createCommandId === input.commandId);
    if (replay) return replay;
  }
  await validateShiftAssignmentTarget(deps, input);
  const shift = (await deps.workShifts.findById(input.tenantId, input.workShiftId))!;

  const assignment: ShiftAssignment = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: shift.branchId,
    workShiftId: input.workShiftId,
    employmentId: input.employmentId,
    roleCode: input.roleCode,
    ...(input.stationId ? { stationId: input.stationId } : {}),
    ...(input.commandId ? { createCommandId: input.commandId } : {}),
    status: "PROPOSED",
    revision: 0,
    createdAt: now,
    updatedAt: now,
  };
  await deps.shiftAssignments.save(assignment);
  if (deps.outbox) {
    await deps.outbox.append(shiftAssignmentCreatedEvent(assignment, input.commandId ?? randomUUID()));
  }
  return assignment;
}

export async function confirmShiftAssignment(
  deps: ShiftAssignmentDeps,
  tenantId: string,
  assignmentId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<ShiftAssignment> {
  const assignment = await deps.shiftAssignments.findById(tenantId, assignmentId);
  if (!assignment) throw new Error(`ShiftAssignment ${assignmentId} not found`);
  if (commandId && assignment.decisionCommandId === commandId) return assignment;
  const confirmed = transitionShiftAssignment(assignment, "CONFIRMED", now, commandId);
  await deps.shiftAssignments.save(confirmed);
  if (deps.outbox) {
    await deps.outbox.append(shiftAssignmentConfirmedEvent(confirmed, commandId ?? randomUUID()));
  }
  return confirmed;
}

export async function declineShiftAssignment(
  deps: ShiftAssignmentDeps,
  tenantId: string,
  assignmentId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<ShiftAssignment> {
  const assignment = await deps.shiftAssignments.findById(tenantId, assignmentId);
  if (!assignment) throw new Error(`ShiftAssignment ${assignmentId} not found`);
  if (commandId && assignment.decisionCommandId === commandId) return assignment;
  const declined = transitionShiftAssignment(assignment, "DECLINED", now, commandId);
  await deps.shiftAssignments.save(declined);
  if (deps.outbox) {
    await deps.outbox.append(shiftAssignmentDeclinedEvent(declined, commandId ?? randomUUID()));
  }
  return declined;
}

export async function cancelShiftAssignment(
  deps: ShiftAssignmentDeps,
  tenantId: string,
  assignmentId: string,
  commandId?: string | null,
  now = new Date(),
): Promise<ShiftAssignment> {
  const assignment = await deps.shiftAssignments.findById(tenantId, assignmentId);
  if (!assignment) throw new Error(`ShiftAssignment ${assignmentId} not found`);
  if (commandId && assignment.decisionCommandId === commandId) return assignment;
  const cancelled = transitionShiftAssignment(assignment, "CANCELLED", now, commandId);
  await deps.shiftAssignments.save(cancelled);
  if (deps.outbox) {
    await deps.outbox.append(shiftAssignmentCancelledEvent(cancelled, commandId ?? randomUUID()));
  }
  return cancelled;
}

export async function reassignShiftAssignment(
  deps: ShiftAssignmentDeps,
  input: ReassignShiftAssignmentInput,
): Promise<{ previous: ShiftAssignment; current: ShiftAssignment }> {
  const now = input.now ?? new Date();
  const previous = await deps.shiftAssignments.findById(input.tenantId, input.assignmentId);
  if (!previous) throw new Error(`ShiftAssignment ${input.assignmentId} not found`);
  if (input.commandId && previous.decisionCommandId === input.commandId) {
    const assignments = await deps.shiftAssignments.listByShift(input.tenantId, previous.workShiftId);
    const replayCurrent = assignments.find((item) => item.createCommandId === input.commandId);
    if (replayCurrent) {
      return { previous, current: replayCurrent };
    }
  }

  await validateShiftAssignmentTarget(deps, {
    tenantId: input.tenantId,
    workShiftId: previous.workShiftId,
    employmentId: input.employmentId,
  });

  const cancelled = transitionShiftAssignment(previous, "CANCELLED", now, input.commandId);
  await deps.shiftAssignments.save(cancelled);

  const created = await createShiftAssignment(deps, {
    tenantId: input.tenantId,
    workShiftId: previous.workShiftId,
    employmentId: input.employmentId,
    roleCode: input.roleCode,
    ...(input.stationId ? { stationId: input.stationId } : {}),
    ...(input.commandId ? { commandId: input.commandId } : {}),
    now,
  });

  if (input.confirmNewAssignment) {
    const confirmed = transitionShiftAssignment(created, "CONFIRMED", now, input.commandId);
    await deps.shiftAssignments.save(confirmed);
    return { previous: cancelled, current: confirmed };
  }

  return { previous: cancelled, current: created };
}
