import { randomUUID } from "node:crypto";
import type { WorkShift } from "../domain/work-shift.js";
import type { ShiftAssignment } from "../domain/shift-assignment.js";
import type { OutboxRecord } from "@maitre/organization";

function record<T>(
  eventName: string,
  aggregateType: string,
  aggregateId: string,
  tenantId: string,
  correlationId: string,
  occurredAt: Date,
  payload: T,
): OutboxRecord<T> {
  return {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    occurredAt,
    producer: "workforce",
    tenantId,
    aggregateType,
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

export interface WorkShiftStartedPayload {
  workShiftId: string;
  branchId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  startedAt: string;
  laborPolicyVersion: string;
  aggregateRevision: number;
  actorType: "INTERNAL";
}

export function workShiftStartedEvent(
  shift: WorkShift,
  correlationId: string,
): OutboxRecord<WorkShiftStartedPayload> {
  const startedAt = shift.startedAt ?? shift.updatedAt;
  return record(
    "workforce.work-shift.started.v1",
    "WorkShift",
    shift.id,
    shift.tenantId,
    correlationId,
    startedAt,
    {
      workShiftId: shift.id,
      branchId: shift.branchId,
      startsAtUtc: shift.startsAtUtc.toISOString(),
      endsAtUtc: shift.endsAtUtc.toISOString(),
      startedAt: startedAt.toISOString(),
      laborPolicyVersion: shift.laborPolicyVersion,
      aggregateRevision: shift.revision,
      actorType: "INTERNAL",
    },
  );
}

export interface WorkShiftCompletedPayload {
  workShiftId: string;
  branchId: string;
  completedAt: string;
  laborPolicyVersion: string;
  aggregateRevision: number;
  outcome: "COMPLETED";
  actorType: "INTERNAL";
}

export function workShiftCompletedEvent(
  shift: WorkShift,
  correlationId: string,
): OutboxRecord<WorkShiftCompletedPayload> {
  const completedAt = shift.completedAt ?? shift.updatedAt;
  return record(
    "workforce.work-shift.completed.v1",
    "WorkShift",
    shift.id,
    shift.tenantId,
    correlationId,
    completedAt,
    {
      workShiftId: shift.id,
      branchId: shift.branchId,
      completedAt: completedAt.toISOString(),
      laborPolicyVersion: shift.laborPolicyVersion,
      aggregateRevision: shift.revision,
      outcome: "COMPLETED",
      actorType: "INTERNAL",
    },
  );
}

export interface ShiftAssignmentEventPayload {
  shiftAssignmentId: string;
  workShiftId: string;
  branchId: string;
  employmentId: string;
  roleCode: string;
  status: string;
  aggregateRevision: number;
  actorType: "INTERNAL";
}

function shiftAssignmentPayload(assignment: ShiftAssignment): ShiftAssignmentEventPayload {
  return {
    shiftAssignmentId: assignment.id,
    workShiftId: assignment.workShiftId,
    branchId: assignment.branchId,
    employmentId: assignment.employmentId,
    roleCode: assignment.roleCode,
    status: assignment.status,
    aggregateRevision: assignment.revision,
    actorType: "INTERNAL",
  };
}

export function shiftAssignmentCreatedEvent(
  assignment: ShiftAssignment,
  correlationId: string,
): OutboxRecord<ShiftAssignmentEventPayload> {
  return record(
    "workforce.shift-assignment.created.v1",
    "ShiftAssignment",
    assignment.id,
    assignment.tenantId,
    correlationId,
    assignment.createdAt,
    shiftAssignmentPayload(assignment),
  );
}

export function shiftAssignmentConfirmedEvent(
  assignment: ShiftAssignment,
  correlationId: string,
): OutboxRecord<ShiftAssignmentEventPayload> {
  return record(
    "workforce.shift-assignment.confirmed.v1",
    "ShiftAssignment",
    assignment.id,
    assignment.tenantId,
    correlationId,
    assignment.updatedAt,
    shiftAssignmentPayload(assignment),
  );
}

export function shiftAssignmentDeclinedEvent(
  assignment: ShiftAssignment,
  correlationId: string,
): OutboxRecord<ShiftAssignmentEventPayload> {
  return record(
    "workforce.shift-assignment.declined.v1",
    "ShiftAssignment",
    assignment.id,
    assignment.tenantId,
    correlationId,
    assignment.updatedAt,
    shiftAssignmentPayload(assignment),
  );
}

export function shiftAssignmentCancelledEvent(
  assignment: ShiftAssignment,
  correlationId: string,
): OutboxRecord<ShiftAssignmentEventPayload> {
  return record(
    "workforce.shift-assignment.cancelled.v1",
    "ShiftAssignment",
    assignment.id,
    assignment.tenantId,
    correlationId,
    assignment.updatedAt,
    shiftAssignmentPayload(assignment),
  );
}
