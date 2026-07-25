import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE,
  clockIn,
  clockOut,
  requestTimeAdjustment,
  approveRequestedTimeAdjustment,
  rejectRequestedTimeAdjustment,
  OpenTimeEntryConflictError,
  OpenBreakOnClockOutError,
  resolveBreakClockOutPolicy,
  SelfApprovalNotAllowedError,
  InvalidTimeAdjustmentError,
  StaleTimeAdjustmentApprovalError,
} from "../index.js";
import {
  FakeEmploymentRepository,
  FakeBreakLogRepository,
  FakeShiftAssignmentRepository,
  FakeTimeAdjustmentRepository,
  FakeTimeEntryRepository,
  anEmployment,
} from "./fakes.js";

test("clock-in then clock-out closes TimeEntry", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );
  assert.equal(entry.status, "OPEN");

  const closed = await clockOut(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      employmentId: entry.employmentId,
      capturedAt: new Date("2026-07-24T18:00:00Z"),
      receivedAt: new Date("2026-07-24T18:00:04Z"),
    },
  );
  assert.equal(closed.status, "CLOSED");
});

test("clock-in rejects second OPEN TimeEntry", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  await assert.rejects(
    () =>
      clockIn(
        { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
        {
          tenantId: "11111111-1111-1111-1111-111111111111",
          branchId: "22222222-2222-2222-2222-222222222222",
          employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          capturedAt: new Date("2026-07-24T10:01:00Z"),
          receivedAt: new Date("2026-07-24T10:01:02Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: 2,
        },
      ),
    OpenTimeEntryConflictError,
  );
});

test("clock-in is idempotent for the same commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const first = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      commandId: "11111111-2222-4333-8444-555555555555",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  const replay = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      commandId: "11111111-2222-4333-8444-555555555555",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  assert.equal(replay.id, first.id);
  assert.equal(replay.openedCommandId, "11111111-2222-4333-8444-555555555555");
  assert.equal((await timeEntries.listByEmployment(first.tenantId, first.employmentId)).length, 1);
});

test("clock-in rejects shift assignment that belongs to another employment or branch", async () => {
  const employments = new FakeEmploymentRepository([
    anEmployment(),
    anEmployment({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      employeeCode: "EMP-002",
    }),
  ]);
  const shiftAssignments = new FakeShiftAssignmentRepository([
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      workShiftId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "WAITER",
      status: "PROPOSED",
      revision: 0,
      createdAt: new Date("2026-07-24T10:00:00Z"),
      updatedAt: new Date("2026-07-24T10:00:00Z"),
    },
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "33333333-3333-3333-3333-333333333333",
      workShiftId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      roleCode: "HOST",
      status: "PROPOSED",
      revision: 0,
      createdAt: new Date("2026-07-24T11:00:00Z"),
      updatedAt: new Date("2026-07-24T11:00:00Z"),
    },
  ]);
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  await assert.rejects(
    () =>
      clockIn(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: "11111111-1111-1111-1111-111111111111",
          branchId: "22222222-2222-2222-2222-222222222222",
          employmentId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          shiftAssignmentId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          capturedAt: new Date("2026-07-24T10:00:00Z"),
          receivedAt: new Date("2026-07-24T10:00:05Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: 1,
        },
      ),
    /does not belong to employment/,
  );

  await assert.rejects(
    () =>
      clockIn(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: "11111111-1111-1111-1111-111111111111",
          branchId: "22222222-2222-2222-2222-222222222222",
          employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          shiftAssignmentId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          capturedAt: new Date("2026-07-24T10:00:00Z"),
          receivedAt: new Date("2026-07-24T10:00:05Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: 1,
        },
      ),
    /does not belong to branch/,
  );
});

test("clock-in rejects shift assignment that is not CONFIRMED", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  for (const status of ["PROPOSED", "DECLINED", "CANCELLED"] as const) {
    const shiftAssignments = new FakeShiftAssignmentRepository([
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        tenantId: "11111111-1111-1111-1111-111111111111",
        branchId: "22222222-2222-2222-2222-222222222222",
        workShiftId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        roleCode: "WAITER",
        status,
        revision: 0,
        createdAt: new Date("2026-07-24T10:00:00Z"),
        updatedAt: new Date("2026-07-24T10:00:00Z"),
      },
    ]);

    await assert.rejects(
      () =>
        clockIn(
          { employments, shiftAssignments, timeEntries, timeAdjustments },
          {
            tenantId: "11111111-1111-1111-1111-111111111111",
            branchId: "22222222-2222-2222-2222-222222222222",
            employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            shiftAssignmentId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            capturedAt: new Date("2026-07-24T10:00:00Z"),
            receivedAt: new Date("2026-07-24T10:00:05Z"),
            timezone: "UTC",
            source: "DEVICE",
            deviceId: `device-${status.toLowerCase()}`,
            deviceSequence: 1,
          },
        ),
      /must be CONFIRMED to clock-in/,
    );
  }
});

test("clock-in marks pending review when device sequence is not monotonic", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  const first = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-sequence",
      deviceSequence: 10,
    },
  );
  assert.equal(first.pendingReview, false);

  const closed = await clockOut(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: first.tenantId,
      employmentId: first.employmentId,
      capturedAt: new Date("2026-07-24T18:00:00Z"),
      receivedAt: new Date("2026-07-24T18:00:04Z"),
    },
  );
  assert.equal(closed.status, "CLOSED");

  const second = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T19:00:00Z"),
      receivedAt: new Date("2026-07-24T19:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-sequence",
      deviceSequence: 9,
    },
  );

  assert.equal(second.pendingReview, true);
  assert.equal(second.reviewReason, "DEVICE_SEQUENCE_OUT_OF_ORDER");
});

test("clock-in rejects negative device sequence", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  await assert.rejects(
    () =>
      clockIn(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: "11111111-1111-1111-1111-111111111111",
          branchId: "22222222-2222-2222-2222-222222222222",
          employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          capturedAt: new Date("2026-07-24T10:00:00Z"),
          receivedAt: new Date("2026-07-24T10:00:05Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-negative-sequence",
          deviceSequence: -1,
        },
      ),
    /deviceSequence must be non-negative/,
  );
});

test("clock-out rejects when capturedAt is earlier than clock-in capturedAt", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-invalid-clockout-captured",
      deviceSequence: 1,
    },
  );

  await assert.rejects(
    () =>
      clockOut(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: "11111111-1111-1111-1111-111111111111",
          employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          capturedAt: new Date("2026-07-24T09:59:00Z"),
          receivedAt: new Date("2026-07-24T18:00:04Z"),
        },
      ),
    /closedCapturedAt cannot be earlier than capturedAt/,
  );
});

test("clock-out is idempotent for the same commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      commandId: "11111111-2222-4333-8444-555555555555",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  const first = await clockOut(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      employmentId: entry.employmentId,
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T18:00:00Z"),
      receivedAt: new Date("2026-07-24T18:00:04Z"),
    },
  );

  const replay = await clockOut(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      employmentId: entry.employmentId,
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T18:00:00Z"),
      receivedAt: new Date("2026-07-24T18:00:04Z"),
    },
  );

  assert.equal(replay.id, first.id);
  assert.equal(replay.closedCommandId, "66666666-7777-4888-8999-aaaaaaaaaaaa");
});

test("clock-out rejects when there is an OPEN break", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  await breakLogs.save({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    tenantId: entry.tenantId,
    timeEntryId: entry.id,
    breakType: "MEAL",
    paidClassification: "UNPAID",
    laborPolicyVersion: "v1",
    status: "OPEN",
    openedAt: new Date("2026-07-24T14:00:00Z"),
    effectiveOpenedAt: new Date("2026-07-24T14:00:00Z"),
    timezone: "UTC",
    source: "DEVICE",
    deviceId: "device-1",
    deviceSequence: 2,
    findingReasonCode: null,
    revision: 0,
    createdAt: new Date("2026-07-24T14:00:00Z"),
    updatedAt: new Date("2026-07-24T14:00:00Z"),
  });

  await assert.rejects(
    () =>
      clockOut(
        { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
        {
          tenantId: entry.tenantId,
          employmentId: entry.employmentId,
          capturedAt: new Date("2026-07-24T18:00:00Z"),
          receivedAt: new Date("2026-07-24T18:00:04Z"),
        },
      ),
    OpenBreakOnClockOutError,
  );
});

test("clock-out auto-closes OPEN break when labor policy allows it", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  await breakLogs.save({
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    tenantId: entry.tenantId,
    timeEntryId: entry.id,
    breakType: "MEAL",
    paidClassification: "UNPAID",
    laborPolicyVersion: "labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT",
    status: "OPEN",
    openedAt: new Date("2026-07-24T14:00:00Z"),
    effectiveOpenedAt: new Date("2026-07-24T14:00:00Z"),
    timezone: "UTC",
    source: "DEVICE",
    deviceId: "device-1",
    deviceSequence: 2,
    findingReasonCode: null,
    revision: 0,
    createdAt: new Date("2026-07-24T14:00:00Z"),
    updatedAt: new Date("2026-07-24T14:00:00Z"),
  });

  const closedEntry = await clockOut(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      employmentId: entry.employmentId,
      capturedAt: new Date("2026-07-24T18:00:00Z"),
      receivedAt: new Date("2026-07-24T18:00:04Z"),
    },
  );
  assert.equal(closedEntry.status, "CLOSED");

  const closedBreak = await breakLogs.findById(entry.tenantId, "cccccccc-cccc-4ccc-8ccc-cccccccccccc");
  assert.equal(closedBreak?.status, "CLOSED");
  assert.equal(closedBreak?.closedAt?.toISOString(), "2026-07-24T18:00:00.000Z");
  assert.equal(closedBreak?.effectiveClosedAt?.toISOString(), "2026-07-24T18:00:00.000Z");
  assert.equal(closedBreak?.findingReasonCode, AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE);
});

test("resolveBreakClockOutPolicy returns REJECT by default and AUTO_CLOSE when token is present", () => {
  assert.deepEqual(resolveBreakClockOutPolicy("labor-v1"), { mode: "REJECT" });
  assert.deepEqual(resolveBreakClockOutPolicy("labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT"), {
    mode: "AUTO_CLOSE",
  });
});

test("request and approve adjustment; self-approval is rejected", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:20:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );
  assert.equal(entry.pendingReview, true);

  const adjustment = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      reason: "Fix incorrect clock-in",
      requestedClockInAt: new Date("2026-07-24T10:05:00Z"),
    },
  );
  assert.equal(adjustment.status, "REQUESTED");

  await assert.rejects(
    () =>
      approveRequestedTimeAdjustment(
        { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
        entry.tenantId,
        adjustment.id,
        "user-requester",
      ),
    SelfApprovalNotAllowedError,
  );

  const approved = await approveRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    entry.tenantId,
    adjustment.id,
    "user-approver",
  );
  assert.equal(approved.status, "APPROVED");
  assert.equal(approved.beforeClockInAt?.toISOString(), "2026-07-24T10:00:00.000Z");
  assert.equal(approved.afterClockInAt?.toISOString(), "2026-07-24T10:05:00.000Z");
  const adjustedEntry = await timeEntries.findById(entry.tenantId, entry.id);
  assert.equal(adjustedEntry?.capturedAt.toISOString(), "2026-07-24T10:00:00.000Z");
  assert.equal(adjustedEntry?.effectiveCapturedAt?.toISOString(), "2026-07-24T10:05:00.000Z");
  assert.equal(adjustedEntry?.lastApprovedAdjustmentId, approved.id);
  assert.equal(adjustedEntry?.pendingReview, false);

  const adjustment2 = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      reason: "Reject path",
      requestedClockOutAt: new Date("2026-07-24T18:01:00Z"),
    },
  );
  const rejected = await rejectRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments, breakLogs },
    entry.tenantId,
    adjustment2.id,
    "user-approver",
  );
  assert.equal(rejected.status, "REJECTED");
});

test("time adjustment rejects no-op and inverted windows", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  await assert.rejects(
    () =>
      requestTimeAdjustment(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: entry.tenantId,
          timeEntryId: entry.id,
          requesterId: "user-requester",
          reason: "No-op",
        },
      ),
    InvalidTimeAdjustmentError,
  );

  await assert.rejects(
    () =>
      requestTimeAdjustment(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        {
          tenantId: entry.tenantId,
          timeEntryId: entry.id,
          requesterId: "user-requester",
          reason: "Inverted range",
          requestedClockInAt: new Date("2026-07-24T18:00:00Z"),
          requestedClockOutAt: new Date("2026-07-24T09:00:00Z"),
        },
      ),
    InvalidTimeAdjustmentError,
  );
});

test("time adjustment approval rejects stale base", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  const first = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      reason: "First correction",
      requestedClockInAt: new Date("2026-07-24T10:01:00Z"),
    },
  );

  await approveRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    entry.tenantId,
    first.id,
    "user-approver",
  );

  const stale = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester-2",
      reason: "Built on adjusted state",
      requestedClockInAt: new Date("2026-07-24T10:02:00Z"),
    },
  );

  const adjustedEntry = await timeEntries.findById(entry.tenantId, entry.id);
  await timeEntries.save({
    ...adjustedEntry!,
    effectiveCapturedAt: new Date("2026-07-24T10:03:00Z"),
    revision: adjustedEntry!.revision + 1,
    updatedAt: new Date("2026-07-24T10:03:00Z"),
  });

  await assert.rejects(
    () =>
      approveRequestedTimeAdjustment(
        { employments, shiftAssignments, timeEntries, timeAdjustments },
        entry.tenantId,
        stale.id,
        "user-approver",
      ),
    StaleTimeAdjustmentApprovalError,
  );
});

test("time adjustment request/decision is idempotent by commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  const requested = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClockInAt: new Date("2026-07-24T10:01:00Z"),
    },
  );
  const requestedReplay = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClockInAt: new Date("2026-07-24T10:01:00Z"),
    },
  );
  assert.equal(requestedReplay.id, requested.id);

  const approved = await approveRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  const approvedReplay = await approveRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  assert.equal(approvedReplay.id, approved.id);
  assert.equal(approvedReplay.status, "APPROVED");
});

test("time adjustment reject is idempotent by commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();

  const entry = await clockIn(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      employmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      capturedAt: new Date("2026-07-24T10:00:00Z"),
      receivedAt: new Date("2026-07-24T10:00:05Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  );

  const requested = await requestTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClockInAt: new Date("2026-07-24T10:01:00Z"),
    },
  );

  const rejected = await rejectRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  const rejectedReplay = await rejectRequestedTimeAdjustment(
    { employments, shiftAssignments, timeEntries, timeAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  assert.equal(rejectedReplay.id, rejected.id);
  assert.equal(rejectedReplay.status, "REJECTED");
});
