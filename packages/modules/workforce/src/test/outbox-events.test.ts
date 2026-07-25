import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkShift,
  publishWorkShift,
  startWorkShift,
  completeWorkShift,
  createShiftAssignment,
  confirmShiftAssignment,
  cancelShiftAssignment,
} from "../index.js";
import { FakeEmploymentRepository, FakeShiftAssignmentRepository, FakeWorkShiftRepository, anEmployment } from "./fakes.js";

class FakeOutboxRepository {
  records: Array<{ eventName: string; aggregateId: string; tenantId?: string; payload: unknown }> = [];
  async append(record: { eventName: string; aggregateId: string; tenantId?: string; payload: unknown }) {
    this.records.push(record);
  }
}

test("startWorkShift appends workforce.work-shift.started.v1", async () => {
  const workShifts = new FakeWorkShiftRepository();
  const outbox = new FakeOutboxRepository();
  const draft = await createWorkShift(
    { workShifts },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      timezone: "UTC",
      businessDate: "2026-07-24",
      startsAtUtc: new Date("2026-07-24T10:00:00Z"),
      endsAtUtc: new Date("2026-07-24T18:00:00Z"),
      laborPolicyVersion: "labor-v1",
    },
  );
  await publishWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T09:00:00Z"));

  const started = await startWorkShift(
    { workShifts, outbox },
    draft.tenantId,
    draft.id,
    new Date("2026-07-24T10:00:00Z"),
    "11111111-1111-4111-8111-111111111111",
  );
  assert.equal(started.status, "IN_PROGRESS");
  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]?.eventName, "workforce.work-shift.started.v1");
  assert.equal(outbox.records[0]?.aggregateId, draft.id);
});

test("completeWorkShift appends workforce.work-shift.completed.v1", async () => {
  const workShifts = new FakeWorkShiftRepository();
  const outbox = new FakeOutboxRepository();
  const draft = await createWorkShift(
    { workShifts },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      timezone: "UTC",
      businessDate: "2026-07-24",
      startsAtUtc: new Date("2026-07-24T10:00:00Z"),
      endsAtUtc: new Date("2026-07-24T18:00:00Z"),
      laborPolicyVersion: "labor-v1",
    },
  );
  await publishWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T09:00:00Z"));
  await startWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T10:00:00Z"));

  const completed = await completeWorkShift(
    { workShifts, outbox },
    draft.tenantId,
    draft.id,
    new Date("2026-07-24T18:00:00Z"),
    "22222222-2222-4222-8222-222222222222",
  );
  assert.equal(completed.status, "COMPLETED");
  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]?.eventName, "workforce.work-shift.completed.v1");
  assert.equal(outbox.records[0]?.aggregateId, draft.id);
});

test("shift assignment commands append assignment outbox events", async () => {
  const employments = new FakeEmploymentRepository([
    anEmployment(),
  ]);
  const workShifts = new FakeWorkShiftRepository();
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const outbox = new FakeOutboxRepository();
  const shift = await createWorkShift(
    { workShifts },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      timezone: "UTC",
      businessDate: "2026-07-24",
      startsAtUtc: new Date("2026-07-24T10:00:00Z"),
      endsAtUtc: new Date("2026-07-24T18:00:00Z"),
      laborPolicyVersion: "labor-v1",
    },
  );

  const assignment = await createShiftAssignment(
    { employments, workShifts, shiftAssignments, outbox },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
      commandId: "11111111-1111-4111-8111-111111111111",
    },
  );
  assert.equal(outbox.records[0]?.eventName, "workforce.shift-assignment.created.v1");
  assert.equal(outbox.records[0]?.aggregateId, assignment.id);

  const confirmed = await confirmShiftAssignment(
    { employments, workShifts, shiftAssignments, outbox },
    shift.tenantId,
    assignment.id,
    "22222222-2222-4222-8222-222222222222",
  );
  assert.equal(confirmed.status, "CONFIRMED");
  assert.equal(outbox.records[1]?.eventName, "workforce.shift-assignment.confirmed.v1");
  assert.equal(outbox.records[1]?.aggregateId, assignment.id);

  const cancelled = await cancelShiftAssignment(
    { employments, workShifts, shiftAssignments, outbox },
    shift.tenantId,
    assignment.id,
    "33333333-3333-4333-8333-333333333333",
  );
  assert.equal(cancelled.status, "CANCELLED");
  assert.equal(outbox.records[2]?.eventName, "workforce.shift-assignment.cancelled.v1");
  assert.equal(outbox.records[2]?.aggregateId, assignment.id);
});
