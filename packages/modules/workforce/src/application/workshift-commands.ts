import { randomUUID } from "node:crypto";
import type { WorkShiftRepositoryPort } from "./ports.js";
import type { OutboxPort } from "@maitre/organization";
import {
  type WorkShift,
  assertWorkShiftInterval,
  transitionWorkShift,
  ActiveWorkShiftConflictError,
} from "../domain/work-shift.js";
import { workShiftStartedEvent, workShiftCompletedEvent } from "./events.js";

interface WorkShiftDeps {
  workShifts: WorkShiftRepositoryPort;
  outbox?: OutboxPort;
}

interface CreateWorkShiftInput {
  tenantId: string;
  branchId: string;
  timezone: string;
  businessDate: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
  laborPolicyVersion: string;
  servicePeriodId?: string | null;
  now?: Date;
}

export async function createWorkShift(
  deps: WorkShiftDeps,
  input: CreateWorkShiftInput,
): Promise<WorkShift> {
  const now = input.now ?? new Date();
  assertWorkShiftInterval(input.startsAtUtc, input.endsAtUtc);
  const shift: WorkShift = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    timezone: input.timezone,
    businessDate: input.businessDate,
    startsAtUtc: input.startsAtUtc,
    endsAtUtc: input.endsAtUtc,
    laborPolicyVersion: input.laborPolicyVersion,
    ...(input.servicePeriodId ? { servicePeriodId: input.servicePeriodId } : {}),
    status: "DRAFT",
    revision: 0,
    createdAt: now,
    updatedAt: now,
  };
  await deps.workShifts.save(shift);
  return shift;
}

async function assertNoIncompatibleActiveShift(
  deps: WorkShiftDeps,
  tenantId: string,
  branchId: string,
  ignoreId: string,
): Promise<void> {
  const shifts = await deps.workShifts.listByBranch(tenantId, branchId);
  const conflict = shifts.find(
    (shift) =>
      shift.id !== ignoreId && (shift.status === "PUBLISHED" || shift.status === "IN_PROGRESS"),
  );
  if (conflict) throw new ActiveWorkShiftConflictError(branchId);
}

export async function publishWorkShift(
  deps: WorkShiftDeps,
  tenantId: string,
  workShiftId: string,
  now = new Date(),
): Promise<WorkShift> {
  const shift = await deps.workShifts.findById(tenantId, workShiftId);
  if (!shift) throw new Error(`WorkShift ${workShiftId} not found`);
  await assertNoIncompatibleActiveShift(deps, tenantId, shift.branchId, shift.id);
  const published = transitionWorkShift(shift, "PUBLISHED", now);
  await deps.workShifts.save(published);
  return published;
}

export async function startWorkShift(
  deps: WorkShiftDeps,
  tenantId: string,
  workShiftId: string,
  now = new Date(),
  correlationId = randomUUID(),
): Promise<WorkShift> {
  const shift = await deps.workShifts.findById(tenantId, workShiftId);
  if (!shift) throw new Error(`WorkShift ${workShiftId} not found`);
  await assertNoIncompatibleActiveShift(deps, tenantId, shift.branchId, shift.id);
  const started = transitionWorkShift(shift, "IN_PROGRESS", now);
  await deps.workShifts.save(started);
  if (deps.outbox) {
    await deps.outbox.append(workShiftStartedEvent(started, correlationId));
  }
  return started;
}

export async function completeWorkShift(
  deps: WorkShiftDeps,
  tenantId: string,
  workShiftId: string,
  now = new Date(),
  correlationId = randomUUID(),
): Promise<WorkShift> {
  const shift = await deps.workShifts.findById(tenantId, workShiftId);
  if (!shift) throw new Error(`WorkShift ${workShiftId} not found`);
  const completed = transitionWorkShift(shift, "COMPLETED", now);
  await deps.workShifts.save(completed);
  if (deps.outbox) {
    await deps.outbox.append(workShiftCompletedEvent(completed, correlationId));
  }
  return completed;
}

export async function cancelWorkShift(
  deps: WorkShiftDeps,
  tenantId: string,
  workShiftId: string,
  now = new Date(),
): Promise<WorkShift> {
  const shift = await deps.workShifts.findById(tenantId, workShiftId);
  if (!shift) throw new Error(`WorkShift ${workShiftId} not found`);
  const cancelled = transitionWorkShift(shift, "CANCELLED", now);
  await deps.workShifts.save(cancelled);
  return cancelled;
}
