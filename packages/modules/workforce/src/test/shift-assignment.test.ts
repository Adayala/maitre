import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkShift,
  createShiftAssignment,
  confirmShiftAssignment,
  declineShiftAssignment,
  cancelShiftAssignment,
  reassignShiftAssignment,
  DuplicateShiftAssignmentError,
} from "../index.js";
import {
  FakeEmploymentRepository,
  FakeShiftAssignmentRepository,
  FakeWorkShiftRepository,
  anEmployment,
} from "./fakes.js";

test("ShiftAssignment create/confirm/cancel lifecycle", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const workShifts = new FakeWorkShiftRepository();
  const shiftAssignments = new FakeShiftAssignmentRepository();
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
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
    },
  );
  assert.equal(assignment.status, "PROPOSED");

  const confirmed = await confirmShiftAssignment(
    { employments, workShifts, shiftAssignments },
    shift.tenantId,
    assignment.id,
  );
  assert.equal(confirmed.status, "CONFIRMED");

  const cancelled = await cancelShiftAssignment(
    { employments, workShifts, shiftAssignments },
    shift.tenantId,
    confirmed.id,
  );
  assert.equal(cancelled.status, "CANCELLED");
});

test("ShiftAssignment decline and reassign lifecycle", async () => {
  const employments = new FakeEmploymentRepository([
    anEmployment(),
    anEmployment({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      employeeCode: "EMP-002",
      personRef: "person-2",
    }),
  ]);
  const workShifts = new FakeWorkShiftRepository();
  const shiftAssignments = new FakeShiftAssignmentRepository();
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
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
    },
  );
  const declined = await declineShiftAssignment(
    { employments, workShifts, shiftAssignments },
    shift.tenantId,
    assignment.id,
  );
  assert.equal(declined.status, "DECLINED");

  const assignment2 = await createShiftAssignment(
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
      now: new Date("2026-07-24T09:00:00Z"),
    },
  );
  const result = await reassignShiftAssignment(
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      assignmentId: assignment2.id,
      employmentId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      roleCode: "HOST",
      reason: "Coverage change",
      confirmNewAssignment: true,
      now: new Date("2026-07-24T09:30:00Z"),
    },
  );
  assert.equal(result.previous.status, "CANCELLED");
  assert.equal(result.current.status, "CONFIRMED");
  assert.equal(result.current.employmentId, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
  assert.equal(result.current.roleCode, "HOST");
});

test("ShiftAssignment rejects duplicate employment for the same shift", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const workShifts = new FakeWorkShiftRepository();
  const shiftAssignments = new FakeShiftAssignmentRepository();
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

  await createShiftAssignment(
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
    },
  );

  await assert.rejects(
    () =>
      createShiftAssignment(
        { employments, workShifts, shiftAssignments },
        {
          tenantId: shift.tenantId,
          workShiftId: shift.id,
          employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          roleCode: "SERVER",
        },
      ),
    DuplicateShiftAssignmentError,
  );
});

test("ShiftAssignment reassign keeps previous assignment unchanged when target validation fails", async () => {
  const employments = new FakeEmploymentRepository([
    anEmployment(),
    anEmployment({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      employeeCode: "EMP-002",
      personRef: "person-2",
      eligibleBranchIds: ["33333333-3333-3333-3333-333333333333"],
    }),
  ]);
  const workShifts = new FakeWorkShiftRepository();
  const shiftAssignments = new FakeShiftAssignmentRepository();
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
    { employments, workShifts, shiftAssignments },
    {
      tenantId: shift.tenantId,
      workShiftId: shift.id,
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "SERVER",
    },
  );

  await assert.rejects(
    () =>
      reassignShiftAssignment(
        { employments, workShifts, shiftAssignments },
        {
          tenantId: shift.tenantId,
          assignmentId: assignment.id,
          employmentId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          roleCode: "HOST",
          reason: "Coverage change",
          now: new Date("2026-07-24T09:30:00Z"),
        },
      ),
    /is not eligible for branch/,
  );

  const persisted = await shiftAssignments.findById(shift.tenantId, assignment.id);
  assert.equal(persisted?.status, "PROPOSED");
});
