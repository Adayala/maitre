import test from "node:test";
import assert from "node:assert/strict";
import {
  clockIn,
  startBreak,
  endBreak,
  BreakRevisionConflictError,
  requestBreakAdjustment,
  approveRequestedBreakAdjustment,
  rejectRequestedBreakAdjustment,
  OpenBreakConflictError,
  SelfBreakApprovalNotAllowedError,
  InvalidBreakAdjustmentError,
  StaleBreakAdjustmentApprovalError,
} from "../index.js";
import {
  FakeEmploymentRepository,
  FakeShiftAssignmentRepository,
  FakeTimeAdjustmentRepository,
  FakeTimeEntryRepository,
  FakeBreakLogRepository,
  FakeBreakAdjustmentRepository,
  anEmployment,
} from "./fakes.js";

test("break start then end lifecycle", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      commandId: "11111111-2222-4333-8444-555555555555",
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );
  assert.equal(breakLog.status, "OPEN");
  assert.equal(breakLog.openedCommandId, "11111111-2222-4333-8444-555555555555");

  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );
  assert.equal(closed.status, "CLOSED");
  assert.equal(closed.closedCommandId, "66666666-7777-4888-8999-aaaaaaaaaaaa");
});

test("break end rejects stale expected revision", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  await assert.rejects(
    () =>
      endBreak(
        { timeEntries, breakLogs },
        {
          tenantId: entry.tenantId,
          breakLogId: breakLog.id,
          expectedRevision: breakLog.revision + 1,
          closedAt: new Date("2026-07-24T13:30:00Z"),
        },
      ),
    BreakRevisionConflictError,
  );
});

test("break start rejects second OPEN break on same time entry", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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

  await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T12:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  await assert.rejects(
    () =>
      startBreak(
        { timeEntries, breakLogs },
        {
          tenantId: entry.tenantId,
          timeEntryId: entry.id,
          breakType: "OTHER",
          paidClassification: "UNPAID",
          laborPolicyVersion: "labor-v1",
          openedAt: new Date("2026-07-24T12:10:00Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: 3,
        },
      ),
    OpenBreakConflictError,
  );
});

test("break start is idempotent for the same commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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

  const first = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      commandId: "12345678-1234-4234-8234-1234567890ab",
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T12:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  const replay = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      commandId: "12345678-1234-4234-8234-1234567890ab",
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T12:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  assert.equal(replay.id, first.id);
  assert.equal((await breakLogs.listByTimeEntry(entry.tenantId, entry.id)).length, 1);
});

test("break start rejects negative device sequence", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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
      startBreak(
        { timeEntries, breakLogs },
        {
          tenantId: entry.tenantId,
          timeEntryId: entry.id,
          breakType: "REST",
          paidClassification: "PAID",
          laborPolicyVersion: "labor-v1",
          openedAt: new Date("2026-07-24T12:00:00Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: -1,
        },
      ),
    /deviceSequence must be non-negative/,
  );
});

test("break start rejects openedAt earlier than time entry capturedAt", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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
      startBreak(
        { timeEntries, breakLogs },
        {
          tenantId: entry.tenantId,
          timeEntryId: entry.id,
          breakType: "REST",
          paidClassification: "PAID",
          laborPolicyVersion: "labor-v1",
          openedAt: new Date("2026-07-24T09:59:00Z"),
          timezone: "UTC",
          source: "DEVICE",
          deviceId: "device-1",
          deviceSequence: 2,
        },
      ),
    /Break openedAt cannot be earlier than time entry capturedAt/,
  );
});

test("break end is idempotent for the same commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  const first = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      commandId: "abcdefab-cdef-4def-8def-abcdefabcdef",
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );

  const replay = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      commandId: "abcdefab-cdef-4def-8def-abcdefabcdef",
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );

  assert.equal(replay.id, first.id);
  assert.equal(replay.closedCommandId, "abcdefab-cdef-4def-8def-abcdefabcdef");
  assert.equal(replay.revision, first.revision);
});

test("request and approve break adjustment; self-approval is rejected", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();
  const breakAdjustments = new FakeBreakAdjustmentRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );
  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );

  const adjustment = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      reason: "Fix break close time",
      requestedClosedAt: new Date("2026-07-24T13:35:00Z"),
    },
  );
  await assert.rejects(
    () =>
      approveRequestedBreakAdjustment(
        { breakLogs, breakAdjustments },
        entry.tenantId,
        adjustment.id,
        "user-requester",
      ),
    SelfBreakApprovalNotAllowedError,
  );

  const approved = await approveRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    adjustment.id,
    "user-approver",
  );
  assert.equal(approved.status, "APPROVED");
  assert.equal(approved.beforeClosedAt?.toISOString(), "2026-07-24T13:30:00.000Z");
  assert.equal(approved.afterClosedAt?.toISOString(), "2026-07-24T13:35:00.000Z");

  const adjustedBreak = await breakLogs.findById(entry.tenantId, closed.id);
  assert.equal(adjustedBreak?.closedAt?.toISOString(), "2026-07-24T13:30:00.000Z");
  assert.equal(adjustedBreak?.effectiveClosedAt?.toISOString(), "2026-07-24T13:35:00.000Z");

  const adjustment2 = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      reason: "Reject path",
      requestedOpenedAt: new Date("2026-07-24T12:55:00Z"),
    },
  );
  const rejected = await rejectRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    adjustment2.id,
    "user-approver",
  );
  assert.equal(rejected.status, "REJECTED");
});

test("break adjustment rejects no-op and inverted windows", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();
  const breakAdjustments = new FakeBreakAdjustmentRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );

  await assert.rejects(
    () =>
      requestBreakAdjustment(
        { breakLogs, breakAdjustments },
        {
          tenantId: entry.tenantId,
          breakLogId: closed.id,
          requesterId: "user-requester",
          reason: "No-op",
        },
      ),
    InvalidBreakAdjustmentError,
  );

  await assert.rejects(
    () =>
      requestBreakAdjustment(
        { breakLogs, breakAdjustments },
        {
          tenantId: entry.tenantId,
          breakLogId: closed.id,
          requesterId: "user-requester",
          reason: "Inverted range",
          requestedOpenedAt: new Date("2026-07-24T14:00:00Z"),
          requestedClosedAt: new Date("2026-07-24T13:00:00Z"),
        },
      ),
    InvalidBreakAdjustmentError,
  );
});

test("break adjustment approval rejects stale base", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();
  const breakAdjustments = new FakeBreakAdjustmentRepository();

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

  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );

  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );

  const first = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      reason: "First correction",
      requestedClosedAt: new Date("2026-07-24T13:31:00Z"),
    },
  );

  await approveRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    first.id,
    "user-approver",
  );

  const stale = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester-2",
      reason: "Built on adjusted state",
      requestedClosedAt: new Date("2026-07-24T13:32:00Z"),
    },
  );

  const adjustedBreak = await breakLogs.findById(entry.tenantId, closed.id);
  await breakLogs.save({
    ...adjustedBreak!,
    effectiveClosedAt: new Date("2026-07-24T13:33:00Z"),
    revision: adjustedBreak!.revision + 1,
    updatedAt: new Date("2026-07-24T13:33:00Z"),
  });

  await assert.rejects(
    () =>
      approveRequestedBreakAdjustment(
        { breakLogs, breakAdjustments },
        entry.tenantId,
        stale.id,
        "user-approver",
      ),
    StaleBreakAdjustmentApprovalError,
  );
});

test("break adjustment request/decision is idempotent by commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();
  const breakAdjustments = new FakeBreakAdjustmentRepository();

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
  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );
  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );
  const requested = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClosedAt: new Date("2026-07-24T13:31:00Z"),
    },
  );
  const requestedReplay = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClosedAt: new Date("2026-07-24T13:31:00Z"),
    },
  );
  assert.equal(requestedReplay.id, requested.id);

  const approved = await approveRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  const approvedReplay = await approveRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  assert.equal(approvedReplay.id, approved.id);
  assert.equal(approvedReplay.status, "APPROVED");
});

test("break adjustment reject is idempotent by commandId", async () => {
  const employments = new FakeEmploymentRepository([anEmployment()]);
  const shiftAssignments = new FakeShiftAssignmentRepository();
  const timeEntries = new FakeTimeEntryRepository();
  const timeAdjustments = new FakeTimeAdjustmentRepository();
  const breakLogs = new FakeBreakLogRepository();
  const breakAdjustments = new FakeBreakAdjustmentRepository();

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
  const breakLog = await startBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      timeEntryId: entry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: new Date("2026-07-24T13:00:00Z"),
      timezone: "UTC",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  );
  const closed = await endBreak(
    { timeEntries, breakLogs },
    {
      tenantId: entry.tenantId,
      breakLogId: breakLog.id,
      expectedRevision: breakLog.revision,
      closedAt: new Date("2026-07-24T13:30:00Z"),
    },
  );
  const requested = await requestBreakAdjustment(
    { breakLogs, breakAdjustments },
    {
      tenantId: entry.tenantId,
      breakLogId: closed.id,
      requesterId: "user-requester",
      commandId: "11111111-2222-4333-8444-555555555555",
      reason: "Correction",
      requestedClosedAt: new Date("2026-07-24T13:31:00Z"),
    },
  );

  const rejected = await rejectRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  const rejectedReplay = await rejectRequestedBreakAdjustment(
    { breakLogs, breakAdjustments },
    entry.tenantId,
    requested.id,
    "user-approver",
    "66666666-7777-4888-8999-aaaaaaaaaaaa",
  );
  assert.equal(rejectedReplay.id, rejected.id);
  assert.equal(rejectedReplay.status, "REJECTED");
});
