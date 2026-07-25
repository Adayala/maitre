import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import { AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE } from "@maitre/workforce";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";
import type { InMemoryOutboxRepository } from "@maitre/adapter-persistence-memory";
import type {
  Employment,
  EmploymentRepositoryPort,
  WorkShift,
  WorkShiftRepositoryPort,
  ShiftAssignment,
  ShiftAssignmentRepositoryPort,
  TimeEntry,
  TimeEntryRepositoryPort,
  TimeAdjustment,
  TimeAdjustmentRepositoryPort,
  BreakLog,
  BreakLogRepositoryPort,
  BreakAdjustment,
  BreakAdjustmentRepositoryPort,
} from "@maitre/workforce";
import {
  InMemoryLaborPolicyVersionRepository,
  type LaborPolicyVersionRepositoryPort,
} from "../workforce/labor-policy-repository.js";

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  const branchId = branches[0]!.id;
  return { tenantId, branchId };
}

function ownerHeaders(container: Container, tenantId: string) {
  return { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": tenantId };
}

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

class FakeEmploymentRepository implements EmploymentRepositoryPort {
  constructor(private readonly items: Employment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findByEmployeeCode(tenantId: string, employeeCode: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.employeeCode === employeeCode) ?? null;
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((item) => item.tenantId === tenantId);
  }
  async save(employment: Employment) {
    const i = this.items.findIndex((item) => item.id === employment.id);
    if (i >= 0) this.items[i] = employment;
    else this.items.push(employment);
  }
}

class FakeWorkShiftRepository implements WorkShiftRepositoryPort {
  constructor(private readonly items: WorkShift[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.branchId === branchId);
  }
  async save(shift: WorkShift) {
    const i = this.items.findIndex((item) => item.id === shift.id);
    if (i >= 0) this.items[i] = shift;
    else this.items.push(shift);
  }
}

class FakeShiftAssignmentRepository implements ShiftAssignmentRepositoryPort {
  constructor(private readonly items: ShiftAssignment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findByShiftAndEmployment(tenantId: string, workShiftId: string, employmentId: string) {
    return this.items.find(
      (item) =>
        item.tenantId === tenantId &&
        item.workShiftId === workShiftId &&
        item.employmentId === employmentId,
    ) ?? null;
  }
  async listByShift(tenantId: string, workShiftId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.workShiftId === workShiftId);
  }
  async save(assignment: ShiftAssignment) {
    const i = this.items.findIndex((item) => item.id === assignment.id);
    if (i >= 0) this.items[i] = assignment;
    else this.items.push(assignment);
  }
}

class FakeTimeEntryRepository implements TimeEntryRepositoryPort {
  constructor(private readonly items: TimeEntry[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findOpenByEmployment(tenantId: string, employmentId: string) {
    return this.items.find(
      (item) => item.tenantId === tenantId && item.employmentId === employmentId && item.status === "OPEN",
    ) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.branchId === branchId);
  }
  async listByEmployment(tenantId: string, employmentId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.employmentId === employmentId);
  }
  async save(entry: TimeEntry) {
    const i = this.items.findIndex((item) => item.id === entry.id);
    if (i >= 0) this.items[i] = entry;
    else this.items.push(entry);
  }
}

class FakeTimeAdjustmentRepository implements TimeAdjustmentRepositoryPort {
  constructor(private readonly items: TimeAdjustment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId);
  }
  async save(adjustment: TimeAdjustment) {
    const i = this.items.findIndex((item) => item.id === adjustment.id);
    if (i >= 0) this.items[i] = adjustment;
    else this.items.push(adjustment);
  }
}

class FakeBreakLogRepository implements BreakLogRepositoryPort {
  constructor(private readonly items: BreakLog[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findOpenByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.find(
      (item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId && item.status === "OPEN",
    ) ?? null;
  }
  async listByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId);
  }
  async save(breakLog: BreakLog) {
    const i = this.items.findIndex((item) => item.id === breakLog.id);
    if (i >= 0) this.items[i] = breakLog;
    else this.items.push(breakLog);
  }
}

class FakeBreakAdjustmentRepository implements BreakAdjustmentRepositoryPort {
  constructor(private readonly items: BreakAdjustment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByBreakLog(tenantId: string, breakLogId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.breakLogId === breakLogId);
  }
  async save(adjustment: BreakAdjustment) {
    const i = this.items.findIndex((item) => item.id === adjustment.id);
    if (i >= 0) this.items[i] = adjustment;
    else this.items.push(adjustment);
  }
}

async function buildWorkforceTestApp() {
  const container = await buildContainer();
  const extended = container as Container & {
    employments: EmploymentRepositoryPort;
    workShifts: WorkShiftRepositoryPort;
    shiftAssignments: ShiftAssignmentRepositoryPort;
    timeEntries: TimeEntryRepositoryPort;
    timeAdjustments: TimeAdjustmentRepositoryPort;
    breakLogs: BreakLogRepositoryPort;
    breakAdjustments: BreakAdjustmentRepositoryPort;
    laborPolicyVersions: LaborPolicyVersionRepositoryPort;
    now: () => Date;
  };
  extended.employments = new FakeEmploymentRepository();
  extended.workShifts = new FakeWorkShiftRepository();
  extended.shiftAssignments = new FakeShiftAssignmentRepository();
  extended.timeEntries = new FakeTimeEntryRepository();
  extended.timeAdjustments = new FakeTimeAdjustmentRepository();
  extended.breakLogs = new FakeBreakLogRepository();
  extended.breakAdjustments = new FakeBreakAdjustmentRepository();
  extended.laborPolicyVersions = new InMemoryLaborPolicyVersionRepository();
  extended.now = () => new Date("2026-07-25T12:00:00Z");
  const app = await buildApp(extended);
  return { container: extended, app };
}

test("Workforce lifecycle: employment, shift, assignment, clocking, adjustment", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-123",
      employeeCode: "EMP-123",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const createShift = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/work-shifts`,
    headers,
    payload: {
      timezone: "America/Argentina/Buenos_Aires",
      businessDate: "2026-07-24",
      startsAtUtc: "2026-07-24T12:00:00Z",
      endsAtUtc: "2026-07-24T20:00:00Z",
      laborPolicyVersion: "v1",
    },
  });
  assert.equal(createShift.statusCode, 201);
  const shift = createShift.json().data;

  const publish = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(publish.statusCode, 200);
  assert.equal(publish.json().data.status, "PUBLISHED");
  const publishedShift = publish.json().data;

  const assign = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${publishedShift.id}/assignments`,
    headers,
    payload: { employmentId: employment.id, roleCode: "WAITER" },
  });
  assert.equal(assign.statusCode, 201);
  const assignment = assign.json().data;

  const confirm = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/confirm`,
    headers: { ...headers, "if-match": String(assignment.revision) },
  });
  assert.equal(confirm.statusCode, 200);
  assert.equal(confirm.json().data.status, "CONFIRMED");

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      branchId,
      employmentId: employment.id,
      shiftAssignmentId: assignment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  assert.equal(clockIn.json().data.status, "OPEN");
  assert.equal(clockIn.json().data.openedCommandId, "11111111-2222-4333-8444-555555555555");
  const timeEntry = clockIn.json().data;

  const replayClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      branchId,
      employmentId: employment.id,
      shiftAssignmentId: assignment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  });
  assert.equal(replayClockIn.statusCode, 201);
  assert.equal(replayClockIn.json().data.id, timeEntry.id);

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      employmentId: employment.id,
      capturedAt: "2026-07-24T20:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 200);
  assert.equal(clockOut.json().data.status, "CLOSED");
  assert.equal(clockOut.json().data.closedCommandId, "66666666-7777-4888-8999-aaaaaaaaaaaa");

  const replayClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      employmentId: employment.id,
      capturedAt: "2026-07-24T20:00:00Z",
    },
  });
  assert.equal(replayClockOut.statusCode, 200);
  assert.equal(replayClockOut.json().data.id, timeEntry.id);

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      commandId: "12121212-2222-4333-8444-555555555555",
      requesterId: "employee-supervisor-1",
      reason: "Forgot exact checkout time",
      requestedClockOutAt: "2026-07-24T20:05:00Z",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;
  assert.equal(adjustment.requestCommandId, "12121212-2222-4333-8444-555555555555");

  const replayRequestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      commandId: "12121212-2222-4333-8444-555555555555",
      requesterId: "employee-supervisor-1",
      reason: "Forgot exact checkout time",
      requestedClockOutAt: "2026-07-24T20:05:00Z",
    },
  });
  assert.equal(replayRequestAdjustment.statusCode, 201);
  assert.equal(replayRequestAdjustment.json().data.id, adjustment.id);

  const approveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(approveAdjustment.statusCode, 200);
  assert.equal(approveAdjustment.json().data.status, "APPROVED");
  assert.equal(approveAdjustment.json().data.decisionCommandId, "34343434-4444-4555-8666-777777777777");
  assert.equal(
    approveAdjustment.json().data.beforeClockOutAt,
    "2026-07-24T20:00:00.000Z",
  );
  assert.equal(
    approveAdjustment.json().data.afterClockOutAt,
    "2026-07-24T20:05:00.000Z",
  );

  const replayApproveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(replayApproveAdjustment.statusCode, 200);
  assert.equal(replayApproveAdjustment.json().data.id, adjustment.id);

  const listEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries`,
    headers,
  });
  assert.equal(listEntries.statusCode, 200);
  assert.equal(listEntries.json().data[0].capturedAt, "2026-07-24T12:01:00.000Z");
  assert.equal(
    listEntries.json().data[0].effectiveClosedCapturedAt,
    "2026-07-24T20:05:00.000Z",
  );
  await app.close();
});

test("Workforce clock-out rejects when there is an OPEN break", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-break-open",
      employeeCode: "EMP-BREAK-OPEN",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "v1",
      openedAt: "2026-07-24T16:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-24T20:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 409);
  assert.match(clockOut.json().title, /cannot clock-out while BreakLog .* remains OPEN/i);

  await app.close();
});

test("Workforce clock-out auto-closes OPEN break when labor policy allows it", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-break-autoclose",
      employeeCode: "EMP-BREAK-AUTOCLOSE",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT",
      openedAt: "2026-07-24T16:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-1",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-24T20:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 200);
  assert.equal(clockOut.json().data.status, "CLOSED");

  const listBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks`,
    headers,
  });
  assert.equal(listBreaks.statusCode, 200);
  const updatedBreakLog = listBreaks.json().data.find((item: { id: string }) => item.id === breakLog.id);
  assert.equal(updatedBreakLog.status, "CLOSED");
  assert.equal(updatedBreakLog.closedAt, "2026-07-24T20:00:00.000Z");
  assert.equal(updatedBreakLog.effectiveClosedAt, "2026-07-24T20:00:00.000Z");
  assert.equal(updatedBreakLog.findingReasonCode, AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE);

  const auditPage = await container.auditLogs.query({
    tenantId,
    resourceType: "BREAK_LOG",
  });
  assert.equal(auditPage.items.length, 1);
  const auditState = auditPage.items[0]?.newState as
    | {
        mutationType?: string;
        policyDecision?: string;
        laborPolicyVersion?: string;
        findingReasonCode?: string | null;
      }
    | undefined;
  assert.equal(auditState?.mutationType, "AUTO_CLOSE_ON_CLOCK_OUT");
  assert.equal(auditState?.policyDecision, "AUTO_CLOSE_OPEN_BREAK_ON_CLOCK_OUT");
  assert.equal(auditState?.laborPolicyVersion, "labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT");
  assert.equal(auditState?.findingReasonCode, AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE);

  await app.close();
});

test("Workforce authorization and conflicts", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook-workforce",
    displayName: "Demo Cook",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(cook);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: cook.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_cook"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "cook-token-workforce";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook-workforce",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {
      personRef: "person-403",
      employeeCode: "EMP-403",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(forbidden.statusCode, 403);

  const headers = ownerHeaders(container, tenantId);
  await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-dup",
      employeeCode: "EMP-DUP",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  const duplicate = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-dup-2",
      employeeCode: "EMP-DUP",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(duplicate.statusCode, 409);
  await app.close();
});

test("Workforce assignment decline path", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-decline",
      employeeCode: "EMP-DECLINE",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const createShift = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/work-shifts`,
    headers,
    payload: {
      timezone: "America/Argentina/Buenos_Aires",
      businessDate: "2026-07-24",
      startsAtUtc: "2026-07-24T12:00:00Z",
      endsAtUtc: "2026-07-24T20:00:00Z",
      laborPolicyVersion: "v1",
    },
  });
  assert.equal(createShift.statusCode, 201);
  const shift = createShift.json().data;

  const assign = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers,
    payload: { employmentId: employment.id, roleCode: "HOST" },
  });
  assert.equal(assign.statusCode, 201);
  const assignment = assign.json().data;

  const decline = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/decline`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: { reason: "Employee unavailable" },
  });
  assert.equal(decline.statusCode, 200);
  assert.equal(decline.json().data.status, "DECLINED");
  assert.ok(decline.json().data.declinedAt);

  const cancelAfterDecline = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/cancel`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: { reason: "No longer needed" },
  });
  assert.equal(cancelAfterDecline.statusCode, 409);

  const auditPage = await container.auditLogs.query({
    tenantId,
    resourceType: "SHIFT_ASSIGNMENT",
  });
  assert.equal(auditPage.items.length, 1);
  const declineState = auditPage.items[0]?.newState as { mutationReason?: string } | undefined;
  assert.equal(declineState?.mutationReason, "Employee unavailable");
  await app.close();
});

test("Workforce assignment reassign path", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const firstEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-1",
        employeeCode: "EMP-REASSIGN-1",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-2",
        employeeCode: "EMP-REASSIGN-2",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-24",
        startsAtUtc: "2026-07-24T12:00:00Z",
        endsAtUtc: "2026-07-24T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: firstEmployment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const reassign = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
      confirmNewAssignment: true,
    },
  });
  assert.equal(reassign.statusCode, 200);
  assert.equal(reassign.json().data.previous.status, "CANCELLED");
  assert.equal(reassign.json().data.current.status, "CONFIRMED");
  assert.equal(reassign.json().data.current.employmentId, secondEmployment.id);
  assert.equal(reassign.json().data.current.roleCode, "HOST");

  const auditPage = await container.auditLogs.query({
    tenantId,
    resourceType: "SHIFT_ASSIGNMENT",
  });
  assert.equal(auditPage.items.length, 1);
  const reassignState = auditPage.items[0]?.newState as
    | { mutationReason?: string; mutationType?: string }
    | undefined;
  assert.equal(reassignState?.mutationReason, "Coverage change");
  assert.equal(reassignState?.mutationType, "REASSIGN");
  await app.close();
});

test("Workforce assignment mutating endpoints require valid If-Match revision", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assignment-if-match",
        employeeCode: "EMP-ASSIGN-IF-MATCH",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assignment-if-match-2",
        employeeCode: "EMP-ASSIGN-IF-MATCH-2",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-24",
        startsAtUtc: "2026-07-24T12:00:00Z",
        endsAtUtc: "2026-07-24T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const missingIfMatch = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/confirm`,
    headers,
  });
  assert.equal(missingIfMatch.statusCode, 400);

  const staleIfMatch = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision + 1) },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
    },
  });
  assert.equal(staleIfMatch.statusCode, 409);

  const persisted = await container.shiftAssignments!.findById(tenantId, assignment.id);
  assert.equal(persisted?.status, "PROPOSED");
  assert.equal(persisted?.revision, assignment.revision);

  await app.close();
});

test("Workforce assignment commands are idempotent with Idempotency-Key", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const firstEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assign-idem-1",
        employeeCode: "EMP-ASSIGN-IDEM-1",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assign-idem-2",
        employeeCode: "EMP-ASSIGN-IDEM-2",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-24",
        startsAtUtc: "2026-07-24T12:00:00Z",
        endsAtUtc: "2026-07-24T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const createAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers: { ...headers, "idempotency-key": "assign-create-idem-1" },
    payload: { employmentId: firstEmployment.id, roleCode: "WAITER" },
  });
  assert.equal(createAssignment.statusCode, 201);
  const assignment = createAssignment.json().data;

  const replayCreateAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers: { ...headers, "idempotency-key": "assign-create-idem-1" },
    payload: { employmentId: firstEmployment.id, roleCode: "WAITER" },
  });
  assert.equal(replayCreateAssignment.statusCode, 201);
  assert.equal(replayCreateAssignment.json().data.id, assignment.id);

  const confirmAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/confirm`,
    headers: {
      ...headers,
      "if-match": String(assignment.revision),
      "idempotency-key": "assign-confirm-idem-1",
    },
  });
  assert.equal(confirmAssignment.statusCode, 200);
  const confirmed = confirmAssignment.json().data;

  const replayConfirmAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/confirm`,
    headers: {
      ...headers,
      "if-match": String(assignment.revision),
      "idempotency-key": "assign-confirm-idem-1",
    },
  });
  assert.equal(replayConfirmAssignment.statusCode, 200);
  assert.equal(replayConfirmAssignment.json().data.id, confirmed.id);
  assert.equal(replayConfirmAssignment.json().data.revision, confirmed.revision);

  const reassignAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: {
      ...headers,
      "if-match": String(confirmed.revision),
      "idempotency-key": "assign-reassign-idem-1",
    },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
      confirmNewAssignment: true,
    },
  });
  assert.equal(reassignAssignment.statusCode, 200);
  const reassignResult = reassignAssignment.json().data;

  const replayReassignAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: {
      ...headers,
      "if-match": String(confirmed.revision),
      "idempotency-key": "assign-reassign-idem-1",
    },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
      confirmNewAssignment: true,
    },
  });
  assert.equal(replayReassignAssignment.statusCode, 200);
  assert.equal(replayReassignAssignment.json().data.previous.id, reassignResult.previous.id);
  assert.equal(replayReassignAssignment.json().data.current.id, reassignResult.current.id);

  await app.close();
});

test("Workforce breaks: start, list, end", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-1",
        employeeCode: "EMP-BREAK-1",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-1",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  const timeEntry = clockIn.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-1",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;
  assert.equal(breakLog.status, "OPEN");
  assert.equal(breakLog.openedCommandId, "11111111-2222-4333-8444-555555555555");

  const startBreakReplay = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      commandId: "11111111-2222-4333-8444-555555555555",
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-1",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreakReplay.statusCode, 201);
  assert.equal(startBreakReplay.json().data.id, breakLog.id);

  const listBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks`,
    headers,
  });
  assert.equal(listBreaks.statusCode, 200);
  assert.equal(listBreaks.json().data.length, 1);

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);
  assert.equal(endBreak.json().data.status, "CLOSED");
  assert.equal(endBreak.json().data.closedCommandId, "66666666-7777-4888-8999-aaaaaaaaaaaa");

  const endBreakReplay = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      commandId: "66666666-7777-4888-8999-aaaaaaaaaaaa",
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreakReplay.statusCode, 200);
  assert.equal(endBreakReplay.json().data.id, breakLog.id);
  assert.equal(endBreakReplay.json().data.closedCommandId, "66666666-7777-4888-8999-aaaaaaaaaaaa");

  const staleEndBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: { expectedRevision: breakLog.revision, closedAt: "2026-07-24T13:31:00Z" },
  });
  assert.equal(staleEndBreak.statusCode, 409);

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      commandId: "12121212-2222-4333-8444-555555555555",
      requesterId: "supervisor-1",
      reason: "Fix break end",
      requestedClosedAt: "2026-07-24T13:35:00Z",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;
  assert.equal(adjustment.requestCommandId, "12121212-2222-4333-8444-555555555555");

  const replayRequestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      commandId: "12121212-2222-4333-8444-555555555555",
      requesterId: "supervisor-1",
      reason: "Fix break end",
      requestedClosedAt: "2026-07-24T13:35:00Z",
    },
  });
  assert.equal(replayRequestAdjustment.statusCode, 201);
  assert.equal(replayRequestAdjustment.json().data.id, adjustment.id);

  const approveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(approveAdjustment.statusCode, 200);
  assert.equal(approveAdjustment.json().data.status, "APPROVED");
  assert.equal(approveAdjustment.json().data.decisionCommandId, "34343434-4444-4555-8666-777777777777");

  const replayApproveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(replayApproveAdjustment.statusCode, 200);
  assert.equal(replayApproveAdjustment.json().data.id, adjustment.id);

  const listAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
  });
  assert.equal(listAdjustments.statusCode, 200);
  assert.equal(listAdjustments.json().data.length, 1);

  const listBreaksAfterAdjustment = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks`,
    headers,
  });
  assert.equal(listBreaksAfterAdjustment.statusCode, 200);
  assert.equal(
    listBreaksAfterAdjustment.json().data[0].effectiveClosedAt,
    "2026-07-24T13:35:00.000Z",
  );
  await app.close();
});

test("Workforce adjustments reject invalid HTTP payload semantics", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-adjustment-invalid",
        employeeCode: "EMP-ADJ-INVALID",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-invalid-adjustment",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const negativeDeviceSequence = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:05:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-invalid-adjustment",
      deviceSequence: -1,
    },
  });
  assert.equal(negativeDeviceSequence.statusCode, 400);

  const noopTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "No changes",
    },
  });
  assert.equal(noopTimeAdjustment.statusCode, 400);

  const invertedTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "Inverted times",
      requestedClockInAt: "2026-07-24T18:00:00Z",
      requestedClockOutAt: "2026-07-24T09:00:00Z",
    },
  });
  assert.equal(invertedTimeAdjustment.statusCode, 400);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-invalid-adjustment",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const noopBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "No changes",
    },
  });
  assert.equal(noopBreakAdjustment.statusCode, 400);

  const invertedBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "Inverted break times",
      requestedOpenedAt: "2026-07-24T14:00:00Z",
      requestedClosedAt: "2026-07-24T13:00:00Z",
    },
  });
  assert.equal(invertedBreakAdjustment.statusCode, 400);

  await app.close();
});

test("Workforce adjustment approval rejects stale base", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-adjustment-stale",
        employeeCode: "EMP-ADJ-STALE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-stale-adjustment",
      deviceSequence: 1,
    },
  });
  const timeEntry = clockInResponse.json().data;

  const firstTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "First correction",
      requestedClockInAt: "2026-07-24T12:02:00Z",
    },
  });
  assert.equal(firstTimeAdjustment.statusCode, 201);
  const firstTimeAdjustmentId = firstTimeAdjustment.json().data.id;

  const approveFirstTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${firstTimeAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-1" },
  });
  assert.equal(approveFirstTimeAdjustment.statusCode, 200);

  const staleTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-2",
      reason: "Second correction",
      requestedClockInAt: "2026-07-24T12:03:00Z",
    },
  });
  assert.equal(staleTimeAdjustment.statusCode, 201);
  const staleTimeAdjustmentId = staleTimeAdjustment.json().data.id;

  const storedTimeEntry = await container.timeEntries!.findById(tenantId, timeEntry.id);
  await container.timeEntries!.save({
    ...storedTimeEntry!,
    effectiveCapturedAt: new Date("2026-07-24T12:04:00Z"),
    revision: storedTimeEntry!.revision + 1,
    updatedAt: new Date("2026-07-24T12:04:00Z"),
  });

  const approveStaleTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${staleTimeAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-1" },
  });
  assert.equal(approveStaleTimeAdjustment.statusCode, 409);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-stale-adjustment",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const firstBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-1",
      reason: "First break correction",
      requestedClosedAt: "2026-07-24T13:31:00Z",
    },
  });
  assert.equal(firstBreakAdjustment.statusCode, 201);
  const firstBreakAdjustmentId = firstBreakAdjustment.json().data.id;

  const approveFirstBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${firstBreakAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-1" },
  });
  assert.equal(approveFirstBreakAdjustment.statusCode, 200);

  const staleBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-2",
      reason: "Second break correction",
      requestedClosedAt: "2026-07-24T13:32:00Z",
    },
  });
  assert.equal(staleBreakAdjustment.statusCode, 201);
  const staleBreakAdjustmentId = staleBreakAdjustment.json().data.id;

  const storedBreakLog = await container.breakLogs!.findById(tenantId, breakLog.id);
  await container.breakLogs!.save({
    ...storedBreakLog!,
    effectiveClosedAt: new Date("2026-07-24T13:33:00Z"),
    revision: storedBreakLog!.revision + 1,
    updatedAt: new Date("2026-07-24T13:33:00Z"),
  });

  const approveStaleBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${staleBreakAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-1" },
  });
  assert.equal(approveStaleBreakAdjustment.statusCode, 409);

  await app.close();
});

test("Workforce adjustment reject is idempotent", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-adjustment-reject",
        employeeCode: "EMP-ADJ-REJECT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-adjustment-reject",
      deviceSequence: 1,
    },
  });
  const timeEntry = clockInResponse.json().data;

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      commandId: "12121212-2222-4333-8444-555555555555",
      requesterId: "supervisor-1",
      reason: "Reject me",
      requestedClockInAt: "2026-07-24T12:02:00Z",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;

  const rejectAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(rejectAdjustment.statusCode, 200);
  assert.equal(rejectAdjustment.json().data.status, "REJECTED");
  assert.equal(rejectAdjustment.json().data.decisionCommandId, "34343434-4444-4555-8666-777777777777");

  const replayRejectAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      commandId: "34343434-4444-4555-8666-777777777777",
      approverId: "manager-1",
    },
  });
  assert.equal(replayRejectAdjustment.statusCode, 200);
  assert.equal(replayRejectAdjustment.json().data.id, adjustment.id);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-adjustment-reject",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const requestBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      commandId: "56565656-6666-4777-8888-999999999999",
      requesterId: "supervisor-1",
      reason: "Reject me too",
      requestedClosedAt: "2026-07-24T13:31:00Z",
    },
  });
  assert.equal(requestBreakAdjustment.statusCode, 201);
  const breakAdjustment = requestBreakAdjustment.json().data;

  const rejectBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustment.id}/reject`,
    headers,
    payload: {
      commandId: "78787878-8888-4999-aaaa-bbbbbbbbbbbb",
      approverId: "manager-1",
    },
  });
  assert.equal(rejectBreakAdjustment.statusCode, 200);
  assert.equal(rejectBreakAdjustment.json().data.status, "REJECTED");
  assert.equal(rejectBreakAdjustment.json().data.decisionCommandId, "78787878-8888-4999-aaaa-bbbbbbbbbbbb");

  const replayRejectBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustment.id}/reject`,
    headers,
    payload: {
      commandId: "78787878-8888-4999-aaaa-bbbbbbbbbbbb",
      approverId: "manager-1",
    },
  });
  assert.equal(replayRejectBreakAdjustment.statusCode, 200);
  assert.equal(replayRejectBreakAdjustment.json().data.id, breakAdjustment.id);

  await app.close();
});

test("Workforce break adjustment approve rejects self-approval", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-self-approve",
        employeeCode: "EMP-BREAK-SELF-APPROVE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-approve",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-approve",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "user-requester",
        reason: "Fix break close",
        requestedClosedAt: "2026-07-24T13:35:00Z",
      },
    })
  ).json().data;

  const selfApprove = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      approverId: "user-requester",
    },
  });

  assert.equal(selfApprove.statusCode, 409);

  await app.close();
});

test("Workforce break adjustment reject rejects self-approval", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-self-reject",
        employeeCode: "EMP-BREAK-SELF-REJECT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-reject",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-reject",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "user-requester",
        reason: "Reject path",
        requestedClosedAt: "2026-07-24T13:35:00Z",
      },
    })
  ).json().data;

  const selfReject = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      approverId: "user-requester",
    },
  });

  assert.equal(selfReject.statusCode, 409);

  await app.close();
});

test("Workforce break adjustment approve returns 409 when adjustment is already rejected", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-approve-rejected",
        employeeCode: "EMP-BREAK-APPROVE-REJECTED",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-approve-rejected",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-approve-rejected",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-1",
        reason: "Reject then approve",
        requestedClosedAt: "2026-07-24T13:31:00Z",
      },
    })
  ).json().data;

  const rejectAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      approverId: "manager-1",
    },
  });
  assert.equal(rejectAdjustment.statusCode, 200);

  const approveRejected = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      approverId: "manager-2",
    },
  });

  assert.equal(approveRejected.statusCode, 409);

  await app.close();
});

test("Workforce break adjustment reject returns 409 when adjustment is already approved", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-reject-approved",
        employeeCode: "EMP-BREAK-REJECT-APPROVED",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-reject-approved",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-reject-approved",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-1",
        reason: "Approve then reject",
        requestedClosedAt: "2026-07-24T13:31:00Z",
      },
    })
  ).json().data;

  const approveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      approverId: "manager-1",
    },
  });
  assert.equal(approveAdjustment.statusCode, 200);

  const rejectApproved = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      approverId: "manager-2",
    },
  });

  assert.equal(rejectApproved.statusCode, 409);

  await app.close();
});

test("Workforce break adjustment approve returns 409 when adjustment is already approved", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-approve-approved",
        employeeCode: "EMP-BREAK-APPROVE-APPROVED",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-approve-approved",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-approve-approved",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-1",
        reason: "Approve twice",
        requestedClosedAt: "2026-07-24T13:31:00Z",
      },
    })
  ).json().data;

  const approveAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      approverId: "manager-1",
    },
  });
  assert.equal(approveAdjustment.statusCode, 200);

  const approveApproved = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/approve`,
    headers,
    payload: {
      approverId: "manager-2",
    },
  });

  assert.equal(approveApproved.statusCode, 409);

  await app.close();
});

test("Workforce break adjustment reject returns 409 when adjustment is already rejected", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-reject-rejected",
        employeeCode: "EMP-BREAK-REJECT-REJECTED",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:01:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-reject-rejected",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  const timeEntry = clockInResponse.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-reject-rejected",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const breakLog = startBreak.json().data;

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/end`,
    headers,
    payload: {
      expectedRevision: breakLog.revision,
      closedAt: "2026-07-24T13:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const adjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-1",
        reason: "Reject twice",
        requestedClosedAt: "2026-07-24T13:31:00Z",
      },
    })
  ).json().data;

  const rejectAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      approverId: "manager-1",
    },
  });
  assert.equal(rejectAdjustment.statusCode, 200);

  const rejectRejected = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${adjustment.id}/reject`,
    headers,
    payload: {
      approverId: "manager-2",
    },
  });

  assert.equal(rejectRejected.statusCode, 409);

  await app.close();
});

test("Workforce list endpoints support status filters", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-filters",
        employeeCode: "EMP-FILTERS",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const openClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T10:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-filters",
      deviceSequence: 1,
    },
  });
  assert.equal(openClockIn.statusCode, 201);
  const openEntry = openClockIn.json().data;

  const openBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: openEntry.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-24T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-filters",
      deviceSequence: 2,
    },
  });
  assert.equal(openBreak.statusCode, 201);

  const closedClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:00:00Z",
    },
  });
  assert.equal(closedClockOut.statusCode, 409);

  const closedBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${openBreak.json().data.id}/end`,
    headers,
    payload: {
      expectedRevision: openBreak.json().data.revision,
      closedAt: "2026-07-24T11:10:00Z",
    },
  });
  assert.equal(closedBreak.statusCode, 200);

  const closeEntry = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-24T12:00:00Z",
    },
  });
  assert.equal(closeEntry.statusCode, 200);

  const secondOpenClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-24T15:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-filters",
      deviceSequence: 3,
    },
  });
  assert.equal(secondOpenClockIn.statusCode, 201);
  const secondOpenEntry = secondOpenClockIn.json().data;
  assert.equal(secondOpenEntry.pendingReview, false);

  const openOnlyEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?status=OPEN`,
    headers,
  });
  assert.equal(openOnlyEntries.statusCode, 200);
  assert.equal(openOnlyEntries.json().data.length, 1);
  assert.equal(openOnlyEntries.json().data[0].id, secondOpenEntry.id);

  const closedOnlyEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?status=CLOSED`,
    headers,
  });
  assert.equal(closedOnlyEntries.statusCode, 200);
  assert.equal(closedOnlyEntries.json().data.length, 1);
  assert.equal(closedOnlyEntries.json().data[0].status, "CLOSED");

  const pendingReviewEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?pendingReview=true`,
    headers,
  });
  assert.equal(pendingReviewEntries.statusCode, 200);
  assert.equal(pendingReviewEntries.json().data.length, 0);

  const nonPendingReviewEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?pendingReview=false`,
    headers,
  });
  assert.equal(nonPendingReviewEntries.statusCode, 200);
  assert.equal(nonPendingReviewEntries.json().data.length, 2);

  const openOnlyBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${openEntry.id}/breaks?status=OPEN`,
    headers,
  });
  assert.equal(openOnlyBreaks.statusCode, 200);
  assert.equal(openOnlyBreaks.json().data.length, 0);

  const closedOnlyBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${openEntry.id}/breaks?status=CLOSED`,
    headers,
  });
  assert.equal(closedOnlyBreaks.statusCode, 200);
  assert.equal(closedOnlyBreaks.json().data.length, 1);
  assert.equal(closedOnlyBreaks.json().data[0].status, "CLOSED");

  const invalidStatus = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?status=PENDING`,
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  const invalidPendingReview = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?pendingReview=maybe`,
    headers,
  });
  assert.equal(invalidPendingReview.statusCode, 400);

  await app.close();
});

test("Workforce branch operational list endpoints", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-ops",
        employeeCode: "EMP-BRANCH-OPS",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  container.now = () => new Date("2026-07-25T12:00:03Z");
  const firstClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T10:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-ops",
      deviceSequence: 1,
    },
  });
  assert.equal(firstClockIn.statusCode, 201);
  const firstEntry = firstClockIn.json().data;
  assert.equal(firstEntry.pendingReview, true);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: firstEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-ops",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);
  const openBreak = startBreak.json().data;

  const branchEntriesOpen = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?status=OPEN`,
    headers,
  });
  assert.equal(branchEntriesOpen.statusCode, 200);
  assert.equal(branchEntriesOpen.json().data.length, 1);
  assert.equal(branchEntriesOpen.json().data[0].id, firstEntry.id);

  const branchEntriesPendingReview = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?pendingReview=true`,
    headers,
  });
  assert.equal(branchEntriesPendingReview.statusCode, 200);
  assert.equal(branchEntriesPendingReview.json().data.length, 1);
  assert.equal(branchEntriesPendingReview.json().data[0].id, firstEntry.id);

  const branchOpenBreaks = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?status=OPEN`,
    headers,
  });
  assert.equal(branchOpenBreaks.statusCode, 200);
  assert.equal(branchOpenBreaks.json().data.length, 1);
  assert.equal(branchOpenBreaks.json().data[0].id, openBreak.id);

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${openBreak.id}/end`,
    headers,
    payload: {
      expectedRevision: openBreak.revision,
      closedAt: "2026-07-25T11:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T18:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 200);

  const branchClosedEntries = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?status=CLOSED`,
    headers,
  });
  assert.equal(branchClosedEntries.statusCode, 200);
  assert.equal(branchClosedEntries.json().data.length, 1);
  assert.equal(branchClosedEntries.json().data[0].id, firstEntry.id);

  const branchClosedBreaks = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?status=CLOSED`,
    headers,
  });
  assert.equal(branchClosedBreaks.statusCode, 200);
  assert.equal(branchClosedBreaks.json().data.length, 1);
  assert.equal(branchClosedBreaks.json().data[0].id, openBreak.id);

  const invalidPendingReview = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?pendingReview=maybe`,
    headers,
  });
  assert.equal(invalidPendingReview.statusCode, 400);

  const secondClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T15:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-ops",
      deviceSequence: 3,
    },
  });
  assert.equal(secondClockIn.statusCode, 201);
  const secondEntry = secondClockIn.json().data;

  const entriesFromFilter = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?from=2026-07-25T14:00:00Z`,
    headers,
  });
  assert.equal(entriesFromFilter.statusCode, 200);
  assert.equal(entriesFromFilter.json().data.length, 1);
  assert.equal(entriesFromFilter.json().data[0].id, secondEntry.id);

  const breaksToFilter = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?to=2026-07-25T11:05:00Z`,
    headers,
  });
  assert.equal(breaksToFilter.statusCode, 200);
  assert.equal(breaksToFilter.json().data.length, 1);
  assert.equal(breaksToFilter.json().data[0].id, openBreak.id);

  const invalidWindow = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?from=2026-07-26T00:00:00Z&to=2026-07-25T00:00:00Z`,
    headers,
  });
  assert.equal(invalidWindow.statusCode, 400);

  await app.close();
});

test("Workforce branch breaks endpoint rejects invalid status filter", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const response = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?status=INVALID`,
    headers,
  });

  assert.equal(response.statusCode, 400);

  await app.close();
});

test("Workforce branch breaks endpoint rejects invalid order", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const response = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?order=INVALID`,
    headers,
  });

  assert.equal(response.statusCode, 400);

  await app.close();
});

test("Workforce branch summary reports operational counters", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-summary",
        employeeCode: "EMP-BRANCH-SUMMARY",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const firstClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T10:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-summary",
      deviceSequence: 1,
    },
  });
  assert.equal(firstClockIn.statusCode, 201);
  const firstEntry = firstClockIn.json().data;

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: firstEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-summary",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);

  const secondClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T15:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-branch-summary",
      deviceSequence: 3,
    },
  });
  assert.equal(secondClockIn.statusCode, 409);

  const summary = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/workforce-summary`,
    headers,
  });
  assert.equal(summary.statusCode, 200);
  assert.equal(summary.json().data.branchId, branchId);
  assert.equal(summary.json().data.openTimeEntriesCount, 1);
  assert.equal(summary.json().data.pendingReviewTimeEntriesCount, 1);
  assert.equal(summary.json().data.openBreaksCount, 1);

  const endBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${startBreak.json().data.id}/end`,
    headers,
    payload: {
      expectedRevision: startBreak.json().data.revision,
      closedAt: "2026-07-25T11:30:00Z",
    },
  });
  assert.equal(endBreak.statusCode, 200);

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T18:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 200);

  const summaryAfterClose = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/workforce-summary`,
    headers,
  });
  assert.equal(summaryAfterClose.statusCode, 200);
  assert.equal(summaryAfterClose.json().data.openTimeEntriesCount, 0);
  assert.equal(summaryAfterClose.json().data.pendingReviewTimeEntriesCount, 1);
  assert.equal(summaryAfterClose.json().data.openBreaksCount, 0);

  await app.close();
});

test("Workforce branch list endpoints support ordering and pagination", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const firstEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-page-1",
        employeeCode: "EMP-PAGE-1",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;
  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-page-2",
        employeeCode: "EMP-PAGE-2",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const firstEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: firstEmployment.id,
        capturedAt: "2026-07-25T09:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-page",
        deviceSequence: 1,
      },
    })
  ).json().data;
  const secondEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: secondEmployment.id,
        capturedAt: "2026-07-25T10:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-page",
        deviceSequence: 2,
      },
    })
  ).json().data;

  const entriesAsc = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?order=capturedAt.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(entriesAsc.statusCode, 200);
  assert.equal(entriesAsc.json().data.length, 1);
  assert.equal(entriesAsc.json().data[0].id, firstEntry.id);
  assert.equal(entriesAsc.json().page.total, 2);
  assert.equal(entriesAsc.json().page.limit, 1);
  assert.equal(entriesAsc.json().page.offset, 0);

  const entriesDescOffset = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?order=capturedAt.desc&limit=1&offset=1`,
    headers,
  });
  assert.equal(entriesDescOffset.statusCode, 200);
  assert.equal(entriesDescOffset.json().data.length, 1);
  assert.equal(entriesDescOffset.json().data[0].id, firstEntry.id);

  const firstBreak = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: firstEntry.id,
        breakType: "REST",
        paidClassification: "PAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-25T09:30:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-page",
        deviceSequence: 3,
      },
    })
  ).json().data;
  const secondBreak = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: secondEntry.id,
        breakType: "MEAL",
        paidClassification: "UNPAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-25T10:30:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-page",
        deviceSequence: 4,
      },
    })
  ).json().data;

  const breaksAsc = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?order=openedAt.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(breaksAsc.statusCode, 200);
  assert.equal(breaksAsc.json().data.length, 1);
  assert.equal(breaksAsc.json().data[0].id, firstBreak.id);
  assert.equal(breaksAsc.json().page.total, 2);

  const breaksDescOffset = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?order=openedAt.desc&limit=1&offset=1`,
    headers,
  });
  assert.equal(breaksDescOffset.statusCode, 200);
  assert.equal(breaksDescOffset.json().data.length, 1);
  assert.equal(breaksDescOffset.json().data[0].id, firstBreak.id);

  const invalidOrder = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-entries?order=invalid`,
    headers,
  });
  assert.equal(invalidOrder.statusCode, 400);

  const invalidLimit = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?limit=0`,
    headers,
  });
  assert.equal(invalidLimit.statusCode, 400);

  await app.close();
});

test("Workforce list contracts are paginated and ordered consistently", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employmentA = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-consistency-a",
        employeeCode: "EMP-200",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;
  const employmentB = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-consistency-b",
        employeeCode: "EMP-100",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const employmentsAsc = await app.inject({
    method: "GET",
    url: "/v1/employments?order=employeeCode.asc&limit=1&offset=0",
    headers,
  });
  assert.equal(employmentsAsc.statusCode, 200);
  assert.equal(employmentsAsc.json().data.length, 1);
  assert.equal(employmentsAsc.json().data[0].id, employmentB.id);
  assert.equal(employmentsAsc.json().page.total, 2);

  const shiftA = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;
  const shiftB = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-26",
        startsAtUtc: "2026-07-26T12:00:00Z",
        endsAtUtc: "2026-07-26T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const shiftsDesc = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/work-shifts?order=startsAtUtc.desc&limit=1&offset=0`,
    headers,
  });
  assert.equal(shiftsDesc.statusCode, 200);
  assert.equal(shiftsDesc.json().data.length, 1);
  assert.equal(shiftsDesc.json().data[0].id, shiftB.id);
  assert.equal(shiftsDesc.json().page.total, 2);

  const assignmentA = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shiftA.id}/assignments`,
      headers,
      payload: { employmentId: employmentA.id, roleCode: "WAITER" },
    })
  ).json().data;
  const assignmentB = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shiftA.id}/assignments`,
      headers,
      payload: { employmentId: employmentB.id, roleCode: "HOST" },
    })
  ).json().data;

  const assignmentsRoleAsc = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shiftA.id}/assignments?order=roleCode.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(assignmentsRoleAsc.statusCode, 200);
  assert.equal(assignmentsRoleAsc.json().data.length, 1);
  assert.equal(assignmentsRoleAsc.json().data[0].id, assignmentB.id);
  assert.equal(assignmentsRoleAsc.json().page.total, 2);

  const invalidEmploymentOrder = await app.inject({
    method: "GET",
    url: "/v1/employments?order=invalid",
    headers,
  });
  assert.equal(invalidEmploymentOrder.statusCode, 400);

  await app.close();
});

test("Workforce remaining list endpoints are paginated and ordered consistently", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-remaining-lists",
        employeeCode: "EMP-REMAINING",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const morningEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-24T12:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-remaining",
        deviceSequence: 1,
      },
    })
  ).json().data;

  const morningBreak = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: morningEntry.id,
        breakType: "MEAL",
        paidClassification: "UNPAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-24T13:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-remaining",
        deviceSequence: 2,
      },
    })
  ).json().data;

  const timeAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/time-entries/${morningEntry.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-remaining",
        reason: "Fix morning clock-out",
        requestedClockOutAt: "2026-07-24T20:05:00Z",
      },
    })
  ).json().data;

  const breakAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${morningBreak.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-remaining",
        reason: "Fix break close",
        requestedClosedAt: "2026-07-24T13:20:00Z",
      },
    })
  ).json().data;

  const morningBreakEnd = await app.inject({
    method: "POST",
    url: `/v1/breaks/${morningBreak.id}/end`,
    headers,
    payload: {
      expectedRevision: morningBreak.revision,
      closedAt: "2026-07-24T13:15:00Z",
    },
  });
  assert.equal(morningBreakEnd.statusCode, 200);

  const morningClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-24T20:00:00Z",
    },
  });
  assert.equal(morningClockOut.statusCode, 200);

  const afternoonEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-24T21:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-remaining",
        deviceSequence: 3,
      },
    })
  ).json().data;

  const afternoonBreak = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: afternoonEntry.id,
        breakType: "REST",
        paidClassification: "PAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-24T22:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-remaining",
        deviceSequence: 4,
      },
    })
  ).json().data;

  const timeEntriesAsc = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?order=capturedAt.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(timeEntriesAsc.statusCode, 200);
  assert.equal(timeEntriesAsc.json().data.length, 1);
  assert.equal(timeEntriesAsc.json().data[0].id, morningEntry.id);
  assert.equal(timeEntriesAsc.json().page.total, 2);

  const breaksDesc = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${afternoonEntry.id}/breaks?order=openedAt.desc&limit=1&offset=0`,
    headers,
  });
  assert.equal(breaksDesc.statusCode, 200);
  assert.equal(breaksDesc.json().data.length, 1);
  assert.equal(breaksDesc.json().data[0].id, afternoonBreak.id);
  assert.equal(breaksDesc.json().page.total, 1);

  const timeAdjustmentsAsc = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${morningEntry.id}/adjustments?order=effectiveAt.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(timeAdjustmentsAsc.statusCode, 200);
  assert.equal(timeAdjustmentsAsc.json().data.length, 1);
  assert.equal(timeAdjustmentsAsc.json().data[0].id, timeAdjustment.id);
  assert.equal(timeAdjustmentsAsc.json().page.total, 1);

  const breakAdjustmentsAsc = await app.inject({
    method: "GET",
    url: `/v1/breaks/${morningBreak.id}/adjustments?order=effectiveAt.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(breakAdjustmentsAsc.statusCode, 200);
  assert.equal(breakAdjustmentsAsc.json().data.length, 1);
  assert.equal(breakAdjustmentsAsc.json().data[0].id, breakAdjustment.id);
  assert.equal(breakAdjustmentsAsc.json().page.total, 1);

  const invalidBreakOrder = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${morningEntry.id}/breaks?order=invalid`,
    headers,
  });
  assert.equal(invalidBreakOrder.statusCode, 400);

  await app.close();
});

test("Workforce singular read endpoints expose operational resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-singular-read",
        employeeCode: "EMP-SINGULAR",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const timeEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-24T12:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-singular",
        deviceSequence: 1,
      },
    })
  ).json().data;

  const breakLog = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: timeEntry.id,
        breakType: "MEAL",
        paidClassification: "UNPAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-24T13:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-singular",
        deviceSequence: 2,
      },
    })
  ).json().data;

  const timeAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/time-entries/${timeEntry.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-singular",
        reason: "Fix clock-out",
        requestedClockOutAt: "2026-07-24T20:05:00Z",
      },
    })
  ).json().data;

  const breakAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-singular",
        reason: "Fix break close",
        requestedClosedAt: "2026-07-24T13:20:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const shiftAssignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const getTimeEntry = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}`,
    headers,
  });
  assert.equal(getTimeEntry.statusCode, 200);
  assert.equal(getTimeEntry.json().data.id, timeEntry.id);

  const getBreakLog = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}`,
    headers,
  });
  assert.equal(getBreakLog.statusCode, 200);
  assert.equal(getBreakLog.json().data.id, breakLog.id);

  const getTimeAdjustment = await app.inject({
    method: "GET",
    url: `/v1/time-adjustments/${timeAdjustment.id}`,
    headers,
  });
  assert.equal(getTimeAdjustment.statusCode, 200);
  assert.equal(getTimeAdjustment.json().data.id, timeAdjustment.id);

  const getBreakAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${breakAdjustment.id}`,
    headers,
  });
  assert.equal(getBreakAdjustment.statusCode, 200);
  assert.equal(getBreakAdjustment.json().data.id, breakAdjustment.id);

  const getShiftAssignment = await app.inject({
    method: "GET",
    url: `/v1/shift-assignments/${shiftAssignment.id}`,
    headers,
  });
  assert.equal(getShiftAssignment.statusCode, 200);
  assert.equal(getShiftAssignment.json().data.id, shiftAssignment.id);

  const missingTimeEntry = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${randomUUID()}`,
    headers,
  });
  assert.equal(missingTimeEntry.statusCode, 404);

  const missingBreakAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${randomUUID()}`,
    headers,
  });
  assert.equal(missingBreakAdjustment.statusCode, 404);

  const missingShiftAssignment = await app.inject({
    method: "GET",
    url: `/v1/shift-assignments/${randomUUID()}`,
    headers,
  });
  assert.equal(missingShiftAssignment.statusCode, 404);

  await app.close();
});

test("Workforce singular break read endpoints reject orphan resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const orphanBreakLogId = randomUUID();
  const orphanBreakAdjustmentId = randomUUID();

  await container.breakLogs!.save({
    id: orphanBreakLogId,
    tenantId,
    timeEntryId: randomUUID(),
    breakType: "MEAL",
    paidClassification: "UNPAID",
    laborPolicyVersion: "labor-v1",
    status: "OPEN",
    openedAt: new Date("2026-07-24T13:00:00Z"),
    effectiveOpenedAt: new Date("2026-07-24T13:00:00Z"),
    timezone: "America/Argentina/Buenos_Aires",
    source: "DEVICE",
    deviceId: "device-orphan-break",
    deviceSequence: 1,
    revision: 0,
    createdAt: new Date("2026-07-24T13:00:00Z"),
    updatedAt: new Date("2026-07-24T13:00:00Z"),
  });

  await container.breakAdjustments!.save({
    id: orphanBreakAdjustmentId,
    tenantId,
    breakLogId: randomUUID(),
    beforeOpenedAt: new Date("2026-07-24T13:00:00Z"),
    beforeClosedAt: new Date("2026-07-24T13:15:00Z"),
    afterOpenedAt: new Date("2026-07-24T13:00:00Z"),
    afterClosedAt: new Date("2026-07-24T13:20:00Z"),
    reason: "orphan adjustment",
    requesterId: "supervisor-orphan",
    status: "REQUESTED",
    createdAt: new Date("2026-07-24T14:00:00Z"),
    updatedAt: new Date("2026-07-24T14:00:00Z"),
  });

  const orphanBreakLog = await app.inject({
    method: "GET",
    url: `/v1/breaks/${orphanBreakLogId}`,
    headers,
  });
  assert.equal(orphanBreakLog.statusCode, 404);

  const orphanBreakAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${orphanBreakAdjustmentId}`,
    headers,
  });
  assert.equal(orphanBreakAdjustment.statusCode, 404);

  await app.close();
});

test("Workforce branch shift assignments endpoint supports filters and pagination", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employmentA = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-assignments-a",
        employeeCode: "EMP-BR-ASSIGN-A",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const employmentB = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-assignments-b",
        employeeCode: "EMP-BR-ASSIGN-B",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignmentA = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employmentA.id, roleCode: "WAITER" },
    })
  ).json().data;

  const assignmentB = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employmentB.id, roleCode: "HOST" },
    })
  ).json().data;

  const confirmB = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignmentB.id}/confirm`,
    headers: { ...headers, "if-match": String(assignmentB.revision) },
  });
  assert.equal(confirmB.statusCode, 200);

  const proposedOnly = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/shift-assignments?status=PROPOSED`,
    headers,
  });
  assert.equal(proposedOnly.statusCode, 200);
  assert.equal(proposedOnly.json().data.length, 1);
  assert.equal(proposedOnly.json().data[0].id, assignmentA.id);

  const roleAsc = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/shift-assignments?order=roleCode.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(roleAsc.statusCode, 200);
  assert.equal(roleAsc.json().data.length, 1);
  assert.equal(roleAsc.json().data[0].id, assignmentB.id);
  assert.equal(roleAsc.json().page.total, 2);

  const createdDescOffset = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/shift-assignments?order=createdAt.desc&limit=1&offset=1`,
    headers,
  });
  assert.equal(createdDescOffset.statusCode, 200);
  assert.equal(createdDescOffset.json().data.length, 1);
  assert.equal(createdDescOffset.json().page.total, 2);

  const invalidStatus = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/shift-assignments?status=INVALID`,
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  await app.close();
});

test("Workforce branch employments endpoint supports filters and pagination", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const otherBranchId = randomUUID();

  const activeEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-employments-a",
        employeeCode: "EMP-BR-200",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const inactiveEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-branch-employments-b",
        employeeCode: "EMP-BR-100",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId, otherBranchId],
        status: "INACTIVE",
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-branch-employments-c",
      employeeCode: "EMP-BR-300",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [otherBranchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });

  const allForBranch = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/employments?order=employeeCode.asc&limit=1&offset=0`,
    headers,
  });
  assert.equal(allForBranch.statusCode, 200);
  assert.equal(allForBranch.json().data.length, 1);
  assert.equal(allForBranch.json().data[0].id, inactiveEmployment.id);
  assert.equal(allForBranch.json().page.total, 2);

  const activeOnly = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/employments?status=ACTIVE`,
    headers,
  });
  assert.equal(activeOnly.statusCode, 200);
  assert.equal(activeOnly.json().data.length, 1);
  assert.equal(activeOnly.json().data[0].id, activeEmployment.id);

  const invalidStatus = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/employments?status=INVALID`,
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  await app.close();
});

test("Workforce branch work shifts endpoint supports status filter", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const draftShift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const publishedShift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-26",
        startsAtUtc: "2026-07-26T12:00:00Z",
        endsAtUtc: "2026-07-26T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const publish = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${publishedShift.id}/publish`,
    headers: { ...headers, "if-match": String(publishedShift.revision) },
  });
  assert.equal(publish.statusCode, 200);

  const draftsOnly = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/work-shifts?status=DRAFT`,
    headers,
  });
  assert.equal(draftsOnly.statusCode, 200);
  assert.equal(draftsOnly.json().data.length, 1);
  assert.equal(draftsOnly.json().data[0].id, draftShift.id);

  const publishedOnly = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/work-shifts?status=PUBLISHED`,
    headers,
  });
  assert.equal(publishedOnly.statusCode, 200);
  assert.equal(publishedOnly.json().data.length, 1);
  assert.equal(publishedOnly.json().data[0].id, publishedShift.id);

  const invalidStatus = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/work-shifts?status=INVALID`,
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  await app.close();
});

test("Workforce shift assignments by shift endpoint supports status filter", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employmentA = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-shift-filter-a",
        employeeCode: "EMP-SHIFT-FILTER-A",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const employmentB = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-shift-filter-b",
        employeeCode: "EMP-SHIFT-FILTER-B",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignmentA = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employmentA.id, roleCode: "WAITER" },
    })
  ).json().data;

  const assignmentB = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employmentB.id, roleCode: "HOST" },
    })
  ).json().data;

  const confirm = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignmentB.id}/confirm`,
    headers: { ...headers, "if-match": String(assignmentB.revision) },
  });
  assert.equal(confirm.statusCode, 200);

  const proposedOnly = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments?status=PROPOSED`,
    headers,
  });
  assert.equal(proposedOnly.statusCode, 200);
  assert.equal(proposedOnly.json().data.length, 1);
  assert.equal(proposedOnly.json().data[0].id, assignmentA.id);

  const confirmedOnly = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments?status=CONFIRMED`,
    headers,
  });
  assert.equal(confirmedOnly.statusCode, 200);
  assert.equal(confirmedOnly.json().data.length, 1);
  assert.equal(confirmedOnly.json().data[0].id, assignmentB.id);

  const invalidStatus = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments?status=INVALID`,
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  await app.close();
});

test("Workforce tenant employments endpoint supports status filter", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const activeEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-tenant-employments-a",
        employeeCode: "EMP-TENANT-200",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const inactiveEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-tenant-employments-b",
        employeeCode: "EMP-TENANT-100",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        status: "INACTIVE",
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const activeOnly = await app.inject({
    method: "GET",
    url: "/v1/employments?status=ACTIVE",
    headers,
  });
  assert.equal(activeOnly.statusCode, 200);
  assert.equal(activeOnly.json().data.length, 1);
  assert.equal(activeOnly.json().data[0].id, activeEmployment.id);

  const inactiveOnly = await app.inject({
    method: "GET",
    url: "/v1/employments?status=INACTIVE&order=employeeCode.asc&limit=1&offset=0",
    headers,
  });
  assert.equal(inactiveOnly.statusCode, 200);
  assert.equal(inactiveOnly.json().data.length, 1);
  assert.equal(inactiveOnly.json().data[0].id, inactiveEmployment.id);
  assert.equal(inactiveOnly.json().page.total, 1);

  const invalidStatus = await app.inject({
    method: "GET",
    url: "/v1/employments?status=INVALID",
    headers,
  });
  assert.equal(invalidStatus.statusCode, 400);

  await app.close();
});

test("Workforce adjustment list endpoints support status filter", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-adjustment-status-filter",
        employeeCode: "EMP-ADJ-STATUS",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const timeEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-24T12:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-adjustment-status",
        deviceSequence: 1,
      },
    })
  ).json().data;

  const breakLog = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: timeEntry.id,
        breakType: "MEAL",
        paidClassification: "UNPAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-24T13:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-adjustment-status",
        deviceSequence: 2,
      },
    })
  ).json().data;

  const timeAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/time-entries/${timeEntry.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-adjustment-status",
        reason: "Fix clock-out",
        requestedClockOutAt: "2026-07-24T20:05:00Z",
      },
    })
  ).json().data;

  const breakAdjustment = (
    await app.inject({
      method: "POST",
      url: `/v1/breaks/${breakLog.id}/adjustments`,
      headers,
      payload: {
        requesterId: "supervisor-adjustment-status",
        reason: "Fix break close",
        requestedClosedAt: "2026-07-24T13:20:00Z",
      },
    })
  ).json().data;

  const approveTimeAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${timeAdjustment.id}/approve`,
    headers,
    payload: {
      approverId: "manager-adjustment-status",
    },
  });
  assert.equal(approveTimeAdjustment.statusCode, 200);

  const rejectBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustment.id}/reject`,
    headers,
    payload: {
      approverId: "manager-adjustment-status",
    },
  });
  assert.equal(rejectBreakAdjustment.statusCode, 200);

  const approvedTimeAdjustments = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/adjustments?status=APPROVED`,
    headers,
  });
  assert.equal(approvedTimeAdjustments.statusCode, 200);
  assert.equal(approvedTimeAdjustments.json().data.length, 1);
  assert.equal(approvedTimeAdjustments.json().data[0].id, timeAdjustment.id);

  const rejectedBreakAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments?status=REJECTED`,
    headers,
  });
  assert.equal(rejectedBreakAdjustments.statusCode, 200);
  assert.equal(rejectedBreakAdjustments.json().data.length, 1);
  assert.equal(rejectedBreakAdjustments.json().data[0].id, breakAdjustment.id);

  const invalidTimeAdjustmentStatus = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/adjustments?status=INVALID`,
    headers,
  });
  assert.equal(invalidTimeAdjustmentStatus.statusCode, 400);

  const invalidBreakAdjustmentStatus = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments?status=INVALID`,
    headers,
  });
  assert.equal(invalidBreakAdjustmentStatus.statusCode, 400);

  await app.close();
});

test("Workforce break list endpoints reject invalid pagination parameters", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-pagination",
        employeeCode: "EMP-BREAK-PAGINATION",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const timeEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-24T12:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-break-pagination",
        deviceSequence: 1,
      },
    })
  ).json().data;

  const breakLog = (
    await app.inject({
      method: "POST",
      url: "/v1/breaks/start",
      headers,
      payload: {
        timeEntryId: timeEntry.id,
        breakType: "MEAL",
        paidClassification: "UNPAID",
        laborPolicyVersion: "labor-v1",
        openedAt: "2026-07-24T13:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-break-pagination",
        deviceSequence: 2,
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-break-pagination",
      reason: "Fix break close",
      requestedClosedAt: "2026-07-24T13:20:00Z",
    },
  });

  const invalidTimeEntryBreakOffset = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks?offset=-1`,
    headers,
  });
  assert.equal(invalidTimeEntryBreakOffset.statusCode, 400);

  const invalidBranchBreakLimit = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks?limit=0`,
    headers,
  });
  assert.equal(invalidBranchBreakLimit.statusCode, 400);

  const invalidBreakAdjustmentOffset = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments?offset=-1`,
    headers,
  });
  assert.equal(invalidBreakAdjustmentOffset.statusCode, 400);

  await app.close();
});

test("Workforce break list endpoints return 404 when parent resource does not exist", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const missingTimeEntryBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${randomUUID()}/breaks`,
    headers,
  });
  assert.equal(missingTimeEntryBreaks.statusCode, 404);

  const missingBreakAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${randomUUID()}/adjustments`,
    headers,
  });
  assert.equal(missingBreakAdjustments.statusCode, 404);

  const missingBranchBreaks = await app.inject({
    method: "GET",
    url: `/v1/branches/${randomUUID()}/breaks`,
    headers,
  });
  assert.equal(missingBranchBreaks.statusCode, 404);

  await app.close();
});

test("Workforce core list endpoints reject invalid pagination parameters", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-core-pagination",
        employeeCode: "EMP-CORE-PAGINATION",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const timeEntry = (
    await app.inject({
      method: "POST",
      url: "/v1/time-entries/clock-in",
      headers,
      payload: {
        branchId,
        employmentId: employment.id,
        capturedAt: "2026-07-25T12:00:00Z",
        timezone: "America/Argentina/Buenos_Aires",
        source: "DEVICE",
        deviceId: "device-core-pagination",
        deviceSequence: 1,
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-core-pagination",
      reason: "Fix clock-out",
      requestedClockOutAt: "2026-07-25T20:05:00Z",
    },
  });

  const invalidEmploymentsOffset = await app.inject({
    method: "GET",
    url: "/v1/employments?offset=-1",
    headers,
  });
  assert.equal(invalidEmploymentsOffset.statusCode, 400);

  const invalidBranchEmploymentsLimit = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/employments?limit=0`,
    headers,
  });
  assert.equal(invalidBranchEmploymentsLimit.statusCode, 400);

  const invalidWorkShiftsOffset = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/work-shifts?offset=-1`,
    headers,
  });
  assert.equal(invalidWorkShiftsOffset.statusCode, 400);

  const invalidBranchAssignmentsLimit = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/shift-assignments?limit=0`,
    headers,
  });
  assert.equal(invalidBranchAssignmentsLimit.statusCode, 400);

  const invalidShiftAssignmentsOffset = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments?offset=-1`,
    headers,
  });
  assert.equal(invalidShiftAssignmentsOffset.statusCode, 400);

  const invalidEmploymentEntriesLimit = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries?limit=0`,
    headers,
  });
  assert.equal(invalidEmploymentEntriesLimit.statusCode, 400);

  const invalidTimeAdjustmentsOffset = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/adjustments?offset=-1`,
    headers,
  });
  assert.equal(invalidTimeAdjustmentsOffset.statusCode, 400);

  void assignment;
  await app.close();
});

test("Workforce API appends outbox events when work shift starts and completes", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const publish = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(publish.statusCode, 200);
  const publishedShift = publish.json().data;

  const before = outboxOf(container).all().length;

  const start = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/start`,
    headers: { ...headers, "if-match": String(publishedShift.revision) },
  });
  assert.equal(start.statusCode, 200);
  const startedShift = start.json().data;

  const complete = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/complete`,
    headers: { ...headers, "if-match": String(startedShift.revision) },
  });
  assert.equal(complete.statusCode, 200);

  const records = outboxOf(container).all().slice(before);
  assert.equal(records.length, 2);
  assert.equal(records[0]?.eventName, "workforce.work-shift.started.v1");
  assert.equal(records[0]?.aggregateId, shift.id);
  assert.equal(records[1]?.eventName, "workforce.work-shift.completed.v1");
  assert.equal(records[1]?.aggregateId, shift.id);

  await app.close();
});

test("Workforce API appends outbox events when shift assignments mutate", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const firstEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assignment-outbox-1",
        employeeCode: "EMP-ASSIGN-OUTBOX-1",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assignment-outbox-2",
        employeeCode: "EMP-ASSIGN-OUTBOX-2",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const before = outboxOf(container).all().length;

  const createAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers: { ...headers, "idempotency-key": "assign-outbox-create-1" },
    payload: { employmentId: firstEmployment.id, roleCode: "WAITER" },
  });
  assert.equal(createAssignment.statusCode, 201);
  const assignment = createAssignment.json().data;

  const confirmAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/confirm`,
    headers: {
      ...headers,
      "if-match": String(assignment.revision),
      "idempotency-key": "assign-outbox-confirm-1",
    },
  });
  assert.equal(confirmAssignment.statusCode, 200);
  const confirmed = confirmAssignment.json().data;

  const reassignAssignment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: {
      ...headers,
      "if-match": String(confirmed.revision),
      "idempotency-key": "assign-outbox-reassign-1",
    },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
      confirmNewAssignment: true,
    },
  });
  assert.equal(reassignAssignment.statusCode, 200);

  const records = outboxOf(container).all().slice(before);
  assert.equal(records.length, 4);
  assert.equal(records[0]?.eventName, "workforce.shift-assignment.created.v1");
  assert.equal(records[0]?.aggregateId, assignment.id);
  assert.equal(records[1]?.eventName, "workforce.shift-assignment.confirmed.v1");
  assert.equal(records[1]?.aggregateId, assignment.id);
  assert.equal(records[2]?.eventName, "workforce.shift-assignment.cancelled.v1");
  assert.equal(records[2]?.aggregateId, assignment.id);
  assert.equal(records[3]?.eventName, "workforce.shift-assignment.created.v1");

  await app.close();
});

test("Workforce mutating endpoints return 404 for missing dependent resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const missingEmploymentAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers,
    payload: { employmentId: randomUUID(), roleCode: "WAITER" },
  });
  assert.equal(missingEmploymentAssignment.statusCode, 404);

  const missingWorkShiftAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${randomUUID()}/assignments`,
    headers,
    payload: { employmentId: randomUUID(), roleCode: "WAITER" },
  });
  assert.equal(missingWorkShiftAssignment.statusCode, 404);

  const missingEmploymentClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: randomUUID(),
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-missing-resource",
      deviceSequence: 1,
    },
  });
  assert.equal(missingEmploymentClockIn.statusCode, 404);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-missing-shift-assignment",
        employeeCode: "EMP-MISSING-SHIFT-ASSIGNMENT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const missingShiftAssignmentClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      shiftAssignmentId: randomUUID(),
      capturedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-missing-resource",
      deviceSequence: 2,
    },
  });
  assert.equal(missingShiftAssignmentClockIn.statusCode, 404);

  await app.close();
});

test("Workforce mutating endpoints return 409 for inactive or ineligible employment", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const otherBranchId = randomUUID();

  const inactiveEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-inactive-employment",
        employeeCode: "EMP-INACTIVE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        status: "INACTIVE",
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const ineligibleEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-ineligible-employment",
        employeeCode: "EMP-INELIGIBLE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const inactiveAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers,
    payload: { employmentId: inactiveEmployment.id, roleCode: "WAITER" },
  });
  assert.equal(inactiveAssignment.statusCode, 409);

  const ineligibleAssignment = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers,
    payload: { employmentId: ineligibleEmployment.id, roleCode: "HOST" },
  });
  assert.equal(ineligibleAssignment.statusCode, 409);

  const inactiveClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: inactiveEmployment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-inactive",
      deviceSequence: 1,
    },
  });
  assert.equal(inactiveClockIn.statusCode, 409);

  const ineligibleClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: ineligibleEmployment.id,
      capturedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-ineligible",
      deviceSequence: 2,
    },
  });
  assert.equal(ineligibleClockIn.statusCode, 409);

  await app.close();
});

test("Workforce reassign returns 409 for inactive or ineligible target employment", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const otherBranchId = randomUUID();

  const sourceEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-source",
        employeeCode: "EMP-REASSIGN-SOURCE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const inactiveEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-inactive",
        employeeCode: "EMP-REASSIGN-INACTIVE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        status: "INACTIVE",
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const ineligibleEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-ineligible",
        employeeCode: "EMP-REASSIGN-INELIGIBLE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: sourceEmployment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const reassignInactive = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: {
      employmentId: inactiveEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
    },
  });
  assert.equal(reassignInactive.statusCode, 409);

  const reassignIneligible = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: {
      employmentId: ineligibleEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
    },
  });
  assert.equal(reassignIneligible.statusCode, 409);

  await app.close();
});

test("Workforce reassign returns 404 for missing target employment", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const sourceEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-reassign-missing-target-source",
        employeeCode: "EMP-REASSIGN-MISSING-TARGET-SOURCE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: sourceEmployment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const reassignMissingEmployment = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: {
      employmentId: randomUUID(),
      roleCode: "HOST",
      reason: "Coverage change",
    },
  });
  assert.equal(reassignMissingEmployment.statusCode, 404);
  assert.equal(reassignMissingEmployment.json().detail, "Employment not found");

  await app.close();
});

test("Workforce assignments return 409 when work shift is cancelled", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const firstEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-cancelled-shift-a",
        employeeCode: "EMP-CANCELLED-SHIFT-A",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const secondEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-cancelled-shift-b",
        employeeCode: "EMP-CANCELLED-SHIFT-B",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: firstEmployment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const cancelShift = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/cancel`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(cancelShift.statusCode, 200);

  const createOnCancelledShift = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers,
    payload: { employmentId: secondEmployment.id, roleCode: "HOST" },
  });
  assert.equal(createOnCancelledShift.statusCode, 409);

  const reassignOnCancelledShift = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${assignment.id}/reassign`,
    headers: { ...headers, "if-match": String(assignment.revision) },
    payload: {
      employmentId: secondEmployment.id,
      roleCode: "HOST",
      reason: "Coverage change",
    },
  });
  assert.equal(reassignOnCancelledShift.statusCode, 409);

  await app.close();
});

test("Workforce work shift API maps invalid interval and invalid transitions correctly", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const invalidInterval = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/work-shifts`,
    headers,
    payload: {
      timezone: "America/Argentina/Buenos_Aires",
      businessDate: "2026-07-25",
      startsAtUtc: "2026-07-25T20:00:00Z",
      endsAtUtc: "2026-07-25T12:00:00Z",
      laborPolicyVersion: "v1",
    },
  });
  assert.equal(invalidInterval.statusCode, 400);

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const completeWithoutStart = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/complete`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(completeWithoutStart.statusCode, 409);

  const publish = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(publish.statusCode, 200);
  const publishedShift = publish.json().data;

  const start = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/start`,
    headers: { ...headers, "if-match": String(publishedShift.revision) },
  });
  assert.equal(start.statusCode, 200);
  const startedShift = start.json().data;

  const cancelAfterStart = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/cancel`,
    headers: { ...headers, "if-match": String(startedShift.revision) },
  });
  assert.equal(cancelAfterStart.statusCode, 409);

  await app.close();
});

test("Workforce work shift commands require valid If-Match revision", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const missingIfMatch = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers,
  });
  assert.equal(missingIfMatch.statusCode, 400);

  const staleIfMatch = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision + 1) },
  });
  assert.equal(staleIfMatch.statusCode, 409);

  const freshPublish = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });
  assert.equal(freshPublish.statusCode, 200);

  await app.close();
});

test("Workforce break start returns 409 when time entry is not OPEN", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-closed-entry",
        employeeCode: "EMP-BREAK-CLOSED-ENTRY",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-closed-entry",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const clockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T20:00:00Z",
    },
  });
  assert.equal(clockOut.statusCode, 200);

  const startBreakOnClosedEntry = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T21:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-closed-entry",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreakOnClosedEntry.statusCode, 409);

  await app.close();
});

test("Workforce break start returns 409 when time entry already has an OPEN break", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-open-conflict",
        employeeCode: "EMP-BREAK-OPEN-CONFLICT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-open-conflict",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const firstBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-open-conflict",
      deviceSequence: 2,
    },
  });
  assert.equal(firstBreak.statusCode, 201);

  const secondBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T13:10:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-open-conflict",
      deviceSequence: 3,
    },
  });
  assert.equal(secondBreak.statusCode, 409);

  await app.close();
});

test("Workforce break end returns 409 when break is already CLOSED", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-already-closed",
        employeeCode: "EMP-BREAK-ALREADY-CLOSED",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-already-closed",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-already-closed",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);

  const firstEnd = await app.inject({
    method: "POST",
    url: `/v1/breaks/${startBreak.json().data.id}/end`,
    headers,
    payload: {
      expectedRevision: startBreak.json().data.revision,
      closedAt: "2026-07-25T13:10:00Z",
    },
  });
  assert.equal(firstEnd.statusCode, 200);

  const secondEnd = await app.inject({
    method: "POST",
    url: `/v1/breaks/${startBreak.json().data.id}/end`,
    headers,
    payload: {
      expectedRevision: firstEnd.json().data.revision,
      closedAt: "2026-07-25T13:11:00Z",
    },
  });
  assert.equal(secondEnd.statusCode, 409);

  await app.close();
});

test("Workforce clock-out returns 404 when no OPEN time entry exists", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clock-out-missing-open",
        employeeCode: "EMP-CLOCKOUT-MISSING-OPEN",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockOutWithoutOpen = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T20:00:00Z",
    },
  });
  assert.equal(clockOutWithoutOpen.statusCode, 404);

  await app.close();
});

test("Workforce clock-out returns 409 when capturedAt is earlier than clock-in capturedAt", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockout-invalid-captured-at",
        employeeCode: "EMP-CLOCKOUT-INVALID-CAPTURED-AT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-clockout-invalid-captured-at",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const invalidClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:59:00Z",
    },
  });
  assert.equal(invalidClockOut.statusCode, 409);

  await app.close();
});

test("Workforce time tracking uses server clock for receivedAt when container.now is available", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  container.now = () => new Date("2026-07-25T16:00:00Z");

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-server-received-at",
        employeeCode: "EMP-SERVER-RECEIVED-AT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T15:59:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-server-received-at",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInResponse.statusCode, 201);
  assert.equal(clockInResponse.json().data.receivedAt, "2026-07-25T16:00:00.000Z");

  container.now = () => new Date("2026-07-25T18:00:00Z");
  const clockOutResponse = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T17:30:00Z",
    },
  });
  assert.equal(clockOutResponse.statusCode, 200);
  assert.equal(clockOutResponse.json().data.closedReceivedAt, "2026-07-25T18:00:00.000Z");

  await app.close();
});

test("Workforce clock-in returns 409 when shift assignment does not belong to employment or branch", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const otherBranchId = randomUUID();

  const employmentA = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockin-assignment-a",
        employeeCode: "EMP-CLOCKIN-ASSIGN-A",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId, otherBranchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const employmentB = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockin-assignment-b",
        employeeCode: "EMP-CLOCKIN-ASSIGN-B",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employmentA.id, roleCode: "WAITER" },
    })
  ).json().data;

  const wrongEmploymentClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employmentB.id,
      shiftAssignmentId: assignment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-clockin-assignment",
      deviceSequence: 1,
    },
  });
  assert.equal(wrongEmploymentClockIn.statusCode, 409);

  const foreignShift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${otherBranchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-26",
        startsAtUtc: "2026-07-26T12:00:00Z",
        endsAtUtc: "2026-07-26T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const foreignAssignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${foreignShift.id}/assignments`,
      headers,
      payload: {
        employmentId: employmentA.id,
        roleCode: "HOST",
      },
    })
  ).json().data;

  const wrongBranchClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employmentA.id,
      shiftAssignmentId: foreignAssignment.id,
      capturedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-clockin-assignment",
      deviceSequence: 2,
    },
  });
  assert.equal(wrongBranchClockIn.statusCode, 409);

  await app.close();
});

test("Workforce clock-in returns 409 when shift assignment is not CONFIRMED", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockin-status",
        employeeCode: "EMP-CLOCKIN-STATUS",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${shift.id}/publish`,
    headers: { ...headers, "if-match": String(shift.revision) },
  });

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;
  assert.equal(assignment.status, "PROPOSED");

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      shiftAssignmentId: assignment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-clockin-status",
      deviceSequence: 1,
    },
  });

  assert.equal(clockIn.statusCode, 409);

  await app.close();
});

test("Workforce clock-in marks pending review when device sequence is not monotonic", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockin-sequence",
        employeeCode: "EMP-CLOCKIN-SEQUENCE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const firstClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-sequence",
      deviceSequence: 10,
    },
  });
  assert.equal(firstClockIn.statusCode, 201);
  assert.equal(firstClockIn.json().data.pendingReview, false);

  container.now = () => new Date("2026-07-25T18:00:03Z");
  const firstClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T18:00:00Z",
    },
  });
  assert.equal(firstClockOut.statusCode, 200);

  container.now = () => new Date("2026-07-25T19:00:03Z");
  const secondClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T19:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-sequence",
      deviceSequence: 9,
    },
  });
  assert.equal(secondClockIn.statusCode, 201);
  assert.equal(secondClockIn.json().data.pendingReview, true);
  assert.equal(secondClockIn.json().data.reviewReason, "DEVICE_SEQUENCE_OUT_OF_ORDER");

  await app.close();
});

test("Workforce break end returns 409 when closedAt is earlier than openedAt", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-invalid-close",
        employeeCode: "EMP-BREAK-INVALID-CLOSE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-invalid-close",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const startBreak = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-invalid-close",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreak.statusCode, 201);

  const invalidEndBreak = await app.inject({
    method: "POST",
    url: `/v1/breaks/${startBreak.json().data.id}/end`,
    headers,
    payload: {
      expectedRevision: startBreak.json().data.revision,
      closedAt: "2026-07-25T12:59:00Z",
    },
  });
  assert.equal(invalidEndBreak.statusCode, 409);

  await app.close();
});

test("Workforce break start rejects negative deviceSequence", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-negative-sequence",
        employeeCode: "EMP-BREAK-NEG-SEQ",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-negative-sequence",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const response = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-negative-sequence",
      deviceSequence: -1,
    },
  });

  assert.equal(response.statusCode, 400);

  await app.close();
});

test("Workforce break start returns 409 when openedAt is earlier than clock-in capturedAt", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-invalid-open",
        employeeCode: "EMP-BREAK-INVALID-OPEN",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T12:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-invalid-open",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const response = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: clockIn.json().data.id,
      breakType: "REST",
      paidClassification: "PAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T11:59:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-invalid-open",
      deviceSequence: 2,
    },
  });

  assert.equal(response.statusCode, 409);

  await app.close();
});

test("Workforce adjustment decision endpoints return 404 for missing base resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const timeAdjustmentId = randomUUID();
  await container.timeAdjustments!.save({
    id: timeAdjustmentId,
    tenantId,
    timeEntryId: randomUUID(),
    reason: "Missing base time entry",
    requesterId: "supervisor-missing-base",
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  });

  const approveMissingTimeEntry = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${timeAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-missing-base" },
  });
  assert.equal(approveMissingTimeEntry.statusCode, 404);
  assert.equal(approveMissingTimeEntry.json().detail, "TimeEntry not found");

  const breakAdjustmentId = randomUUID();
  await container.breakAdjustments!.save({
    id: breakAdjustmentId,
    tenantId,
    breakLogId: randomUUID(),
    reason: "Missing base break log",
    requesterId: "supervisor-missing-base",
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  });

  const rejectMissingBreakLog = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustmentId}/reject`,
    headers,
    payload: { approverId: "manager-missing-base" },
  });
  assert.equal(rejectMissingBreakLog.statusCode, 404);
  assert.equal(rejectMissingBreakLog.json().detail, "BreakLog not found");

  await app.close();
});

test("Workforce break adjustment endpoints return 404 for missing base time entry", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const orphanBreakLogId = randomUUID();
  await container.breakLogs!.save({
    id: orphanBreakLogId,
    tenantId,
    timeEntryId: randomUUID(),
    breakType: "MEAL",
    paidClassification: "UNPAID",
    laborPolicyVersion: "labor-v1",
    status: "CLOSED",
    openedAt: new Date("2026-07-25T11:00:00Z"),
    effectiveOpenedAt: new Date("2026-07-25T11:00:00Z"),
    closedAt: new Date("2026-07-25T11:15:00Z"),
    effectiveClosedAt: new Date("2026-07-25T11:15:00Z"),
    timezone: "America/Argentina/Buenos_Aires",
    source: "DEVICE",
    deviceId: "device-missing-break-time-entry",
    deviceSequence: 1,
    revision: 1,
    createdAt: new Date("2026-07-25T11:00:00Z"),
    updatedAt: new Date("2026-07-25T11:15:00Z"),
  });

  const breakAdjustmentId = randomUUID();
  await container.breakAdjustments!.save({
    id: breakAdjustmentId,
    tenantId,
    breakLogId: orphanBreakLogId,
    beforeOpenedAt: new Date("2026-07-25T11:00:00Z"),
    beforeClosedAt: new Date("2026-07-25T11:15:00Z"),
    afterOpenedAt: new Date("2026-07-25T11:00:00Z"),
    afterClosedAt: new Date("2026-07-25T11:20:00Z"),
    reason: "Missing base time entry",
    requesterId: "supervisor-missing-base",
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  });

  const getMissingTimeEntryBreakAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${breakAdjustmentId}`,
    headers,
  });
  assert.equal(getMissingTimeEntryBreakAdjustment.statusCode, 404);
  assert.equal(getMissingTimeEntryBreakAdjustment.json().detail, "TimeEntry not found");

  const approveMissingTimeEntryBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustmentId}/approve`,
    headers,
    payload: { approverId: "manager-missing-base" },
  });
  assert.equal(approveMissingTimeEntryBreakAdjustment.statusCode, 404);
  assert.equal(approveMissingTimeEntryBreakAdjustment.json().detail, "TimeEntry not found");

  const rejectMissingTimeEntryBreakAdjustment = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${breakAdjustmentId}/reject`,
    headers,
    payload: { approverId: "manager-missing-base" },
  });
  assert.equal(rejectMissingTimeEntryBreakAdjustment.statusCode, 404);
  assert.equal(rejectMissingTimeEntryBreakAdjustment.json().detail, "TimeEntry not found");

  await app.close();
});

test("Workforce break adjustment create/list endpoints return 404 for missing base time entry", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const orphanBreakLogId = randomUUID();
  await container.breakLogs!.save({
    id: orphanBreakLogId,
    tenantId,
    timeEntryId: randomUUID(),
    breakType: "MEAL",
    paidClassification: "UNPAID",
    laborPolicyVersion: "labor-v1",
    status: "CLOSED",
    openedAt: new Date("2026-07-25T11:00:00Z"),
    effectiveOpenedAt: new Date("2026-07-25T11:00:00Z"),
    closedAt: new Date("2026-07-25T11:15:00Z"),
    effectiveClosedAt: new Date("2026-07-25T11:15:00Z"),
    timezone: "America/Argentina/Buenos_Aires",
    source: "DEVICE",
    deviceId: "device-missing-break-time-entry-list",
    deviceSequence: 1,
    revision: 1,
    createdAt: new Date("2026-07-25T11:00:00Z"),
    updatedAt: new Date("2026-07-25T11:15:00Z"),
  });

  const createAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${orphanBreakLogId}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-missing-base",
      reason: "Missing base time entry",
      requestedClosedAt: "2026-07-25T11:20:00Z",
    },
  });
  assert.equal(createAdjustment.statusCode, 404);
  assert.equal(createAdjustment.json().detail, "TimeEntry not found");

  const listAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${orphanBreakLogId}/adjustments`,
    headers,
  });
  assert.equal(listAdjustments.statusCode, 404);
  assert.equal(listAdjustments.json().detail, "TimeEntry not found");

  await app.close();
});

test("Workforce break reads allow self-access with redacted adjustments", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-break-self-read",
    displayName: "Break Self Read",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-break-self-read-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: employeeUser.externalIdentityId,
      employeeCode: "EMP-BREAK-SELF",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-read",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  const timeEntry = clockIn.json().data;

  const startBreakResponse = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T11:30:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-read",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreakResponse.statusCode, 201);
  const breakLog = startBreakResponse.json().data;

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-self-read",
      reason: "Need correction",
      requestedOpenedAt: "2026-07-25T11:35:00Z",
      evidence: "camera-frame-123",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;

  const listBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks`,
    headers: employeeHeaders,
  });
  assert.equal(listBreaks.statusCode, 200);
  assert.equal(listBreaks.json().data.length, 1);
  assert.equal(listBreaks.json().data[0].id, breakLog.id);

  const getBreak = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getBreak.statusCode, 200);
  assert.equal(getBreak.json().data.id, breakLog.id);

  const listAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers: employeeHeaders,
  });
  assert.equal(listAdjustments.statusCode, 200);
  assert.equal(listAdjustments.json().data.length, 1);
  assert.equal(listAdjustments.json().data[0].id, adjustment.id);
  assert.equal(listAdjustments.json().data[0].requesterId, undefined);
  assert.equal(listAdjustments.json().data[0].approverId, undefined);
  assert.equal(listAdjustments.json().data[0].evidence, undefined);

  const getAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${adjustment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getAdjustment.statusCode, 200);
  assert.equal(getAdjustment.json().data.id, adjustment.id);
  assert.equal(getAdjustment.json().data.requesterId, undefined);
  assert.equal(getAdjustment.json().data.approverId, undefined);
  assert.equal(getAdjustment.json().data.evidence, undefined);

  const branchListForbidden = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/breaks`,
    headers: employeeHeaders,
  });
  assert.equal(branchListForbidden.statusCode, 403);

  await app.close();
});

test("Workforce break reads deny self-access to other employment resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-break-self-deny",
    displayName: "Break Self Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-break-self-deny-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-break-someone-else",
      employeeCode: "EMP-BREAK-OTHER",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-deny",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  const timeEntry = clockIn.json().data;

  const startBreakResponse = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: timeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "labor-v1",
      openedAt: "2026-07-25T11:30:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-self-deny",
      deviceSequence: 2,
    },
  });
  assert.equal(startBreakResponse.statusCode, 201);
  const breakLog = startBreakResponse.json().data;

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-self-deny",
      reason: "Need correction",
      requestedOpenedAt: "2026-07-25T11:35:00Z",
      evidence: "camera-frame-456",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;

  const foreignListBreaks = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/breaks`,
    headers: employeeHeaders,
  });
  assert.equal(foreignListBreaks.statusCode, 404);

  const foreignGetBreak = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}`,
    headers: employeeHeaders,
  });
  assert.equal(foreignGetBreak.statusCode, 404);

  const foreignListAdjustments = await app.inject({
    method: "GET",
    url: `/v1/breaks/${breakLog.id}/adjustments`,
    headers: employeeHeaders,
  });
  assert.equal(foreignListAdjustments.statusCode, 404);

  const foreignGetAdjustment = await app.inject({
    method: "GET",
    url: `/v1/break-adjustments/${adjustment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(foreignGetAdjustment.statusCode, 404);

  await app.close();
});

test("Workforce time reads allow self-access with redacted adjustments", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-time-self-read",
    displayName: "Time Self Read",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-time-self-read-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: employeeUser.externalIdentityId,
      employeeCode: "EMP-TIME-SELF",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-time-self-read",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  const timeEntry = clockIn.json().data;

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-time-self-read",
      reason: "Need correction",
      requestedClockInAt: "2026-07-25T11:05:00Z",
      evidence: "camera-frame-time-123",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;

  const getEntry = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getEntry.statusCode, 200);
  assert.equal(getEntry.json().data.id, timeEntry.id);

  const listEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries`,
    headers: employeeHeaders,
  });
  assert.equal(listEntries.statusCode, 200);
  assert.equal(listEntries.json().data.length, 1);
  assert.equal(listEntries.json().data[0].id, timeEntry.id);

  const listAdjustments = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers: employeeHeaders,
  });
  assert.equal(listAdjustments.statusCode, 200);
  assert.equal(listAdjustments.json().data.length, 1);
  assert.equal(listAdjustments.json().data[0].id, adjustment.id);
  assert.equal(listAdjustments.json().data[0].requesterId, undefined);
  assert.equal(listAdjustments.json().data[0].approverId, undefined);
  assert.equal(listAdjustments.json().data[0].evidence, undefined);

  const getAdjustment = await app.inject({
    method: "GET",
    url: `/v1/time-adjustments/${adjustment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getAdjustment.statusCode, 200);
  assert.equal(getAdjustment.json().data.id, adjustment.id);
  assert.equal(getAdjustment.json().data.requesterId, undefined);
  assert.equal(getAdjustment.json().data.approverId, undefined);
  assert.equal(getAdjustment.json().data.evidence, undefined);

  await app.close();
});

test("Workforce time reads deny self-access to other employment resources", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-time-self-deny",
    displayName: "Time Self Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-time-self-deny-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const createEmployment = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-time-someone-else",
      employeeCode: "EMP-TIME-OTHER",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createEmployment.statusCode, 201);
  const employment = createEmployment.json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-time-self-deny",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);
  const timeEntry = clockIn.json().data;

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-time-self-deny",
      reason: "Need correction",
      requestedClockInAt: "2026-07-25T11:05:00Z",
      evidence: "camera-frame-time-456",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const adjustment = requestAdjustment.json().data;

  const foreignGetEntry = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}`,
    headers: employeeHeaders,
  });
  assert.equal(foreignGetEntry.statusCode, 404);

  const foreignListEntries = await app.inject({
    method: "GET",
    url: `/v1/employments/${employment.id}/time-entries`,
    headers: employeeHeaders,
  });
  assert.equal(foreignListEntries.statusCode, 404);

  const foreignListAdjustments = await app.inject({
    method: "GET",
    url: `/v1/time-entries/${timeEntry.id}/adjustments`,
    headers: employeeHeaders,
  });
  assert.equal(foreignListAdjustments.statusCode, 404);

  const foreignGetAdjustment = await app.inject({
    method: "GET",
    url: `/v1/time-adjustments/${adjustment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(foreignGetAdjustment.statusCode, 404);

  await app.close();
});

test("Workforce assignment reads allow self-access to own assignments", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-assignment-self-read",
    displayName: "Assignment Self Read",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-assignment-self-read-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: employeeUser.externalIdentityId,
        employeeCode: "EMP-ASSIGN-SELF",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const listAssignments = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers: employeeHeaders,
  });
  assert.equal(listAssignments.statusCode, 200);
  assert.equal(listAssignments.json().data.length, 1);
  assert.equal(listAssignments.json().data[0].id, assignment.id);

  const getAssignment = await app.inject({
    method: "GET",
    url: `/v1/shift-assignments/${assignment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getAssignment.statusCode, 200);
  assert.equal(getAssignment.json().data.id, assignment.id);

  await app.close();
});

test("Workforce assignment reads deny self-access to other employments", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const employeeUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "person-assignment-self-deny",
    displayName: "Assignment Self Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employeeUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-assignment-self-deny-token";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: employeeUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const employeeHeaders = { authorization: `Bearer ${employeeToken}`, "x-tenant-id": tenantId };

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-assignment-other",
        employeeCode: "EMP-ASSIGN-OTHER",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  const listAssignments = await app.inject({
    method: "GET",
    url: `/v1/work-shifts/${shift.id}/assignments`,
    headers: employeeHeaders,
  });
  assert.equal(listAssignments.statusCode, 200);
  assert.equal(listAssignments.json().data.length, 0);

  const getAssignment = await app.inject({
    method: "GET",
    url: `/v1/shift-assignments/${assignment.id}`,
    headers: employeeHeaders,
  });
  assert.equal(getAssignment.statusCode, 404);

  await app.close();
});

test("Workforce branch time entries endpoint denies branch outside supervisor scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-branch-scope-time",
    displayName: "Scoped Manager Time",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-branch-scope-time-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Otra sucursal",
    code: "OTHER",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const response = await app.inject({
    method: "GET",
    url: `/v1/branches/${otherBranch.id}/time-entries`,
    headers: { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId },
  });
  assert.equal(response.statusCode, 404);

  await app.close();
});

test("Workforce branch-scoped supervisor reads deny branches outside membership scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-branch-scope-all",
    displayName: "Scoped Manager All",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-branch-scope-all-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal fuera de scope",
    code: "OUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  for (const url of [
    `/v1/branches/${otherBranch.id}/employments`,
    `/v1/branches/${otherBranch.id}/work-shifts`,
    `/v1/branches/${otherBranch.id}/workforce-summary`,
    `/v1/branches/${otherBranch.id}/shift-assignments`,
  ]) {
    const response = await app.inject({
      method: "GET",
      url,
      headers: scopedHeaders,
    });
    assert.equal(response.statusCode, 404, url);
  }

  await app.close();
});

test("Workforce shift detail reads deny resources outside supervisor branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-shift-detail-scope",
    displayName: "Scoped Manager Detail",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-shift-detail-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal ajena detalle",
    code: "OUTDET",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-shift-detail-out",
        employeeCode: "EMP-SHIFT-OUT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const shift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${otherBranch.id}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-25",
        startsAtUtc: "2026-07-25T12:00:00Z",
        endsAtUtc: "2026-07-25T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const assignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${shift.id}/assignments`,
      headers,
      payload: { employmentId: employment.id, roleCode: "WAITER" },
    })
  ).json().data;

  for (const url of [
    `/v1/work-shifts/${shift.id}`,
    `/v1/work-shifts/${shift.id}/assignments`,
    `/v1/shift-assignments/${assignment.id}`,
  ]) {
    const response = await app.inject({
      method: "GET",
      url,
      headers: scopedHeaders,
    });
    assert.equal(response.statusCode, 404, url);
  }

  await app.close();
});

test("Workforce employments reads respect supervisor branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-employment-scope",
    displayName: "Scoped Manager Employment",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-employment-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranchId = randomUUID();

  const inScopeEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-employment-scope-a",
        employeeCode: "EMP-SCOPE-A",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers,
    payload: {
      personRef: "person-employment-scope-b",
      employeeCode: "EMP-SCOPE-B",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [otherBranchId],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });

  const intersectingEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-employment-scope-c",
        employeeCode: "EMP-SCOPE-C",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId, otherBranchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const list = await app.inject({
    method: "GET",
    url: "/v1/employments?order=employeeCode.asc",
    headers: scopedHeaders,
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(
    list.json().data.map((employment: { id: string }) => employment.id),
    [inScopeEmployment.id, intersectingEmployment.id],
  );

  const getInScope = await app.inject({
    method: "GET",
    url: `/v1/employments/${inScopeEmployment.id}`,
    headers: scopedHeaders,
  });
  assert.equal(getInScope.statusCode, 200);

  const getOutOfScope = await app.inject({
    method: "GET",
    url: "/v1/employments?status=ACTIVE",
    headers: scopedHeaders,
  });
  assert.equal(getOutOfScope.statusCode, 200);
  assert.equal(getOutOfScope.json().data.some((employment: { employeeCode: string }) => employment.employeeCode === "EMP-SCOPE-B"), false);

  const hiddenDetail = await app.inject({
    method: "GET",
    url: `/v1/employments/${(
      await app.inject({
        method: "POST",
        url: "/v1/employments",
        headers,
        payload: {
          personRef: "person-employment-scope-d",
          employeeCode: "EMP-SCOPE-D",
          relationshipType: "EMPLOYEE",
          eligibleBranchIds: [otherBranchId],
          validFrom: "2026-01-01T00:00:00Z",
        },
      })
    ).json().data.id}`,
    headers: scopedHeaders,
  });
  assert.equal(hiddenDetail.statusCode, 404);

  await app.close();
});

test("Workforce supervisor writes deny resources outside membership branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-write-scope",
    displayName: "Scoped Manager Write",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-write-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal write out",
    code: "WOUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const createForeignEmploymentDenied = await app.inject({
    method: "POST",
    url: "/v1/employments",
    headers: scopedHeaders,
    payload: {
      personRef: "person-write-scope-denied",
      employeeCode: "EMP-WRITE-DENIED",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [otherBranch.id],
      validFrom: "2026-01-01T00:00:00Z",
    },
  });
  assert.equal(createForeignEmploymentDenied.statusCode, 404);

  const createForeignShiftDenied = await app.inject({
    method: "POST",
    url: `/v1/branches/${otherBranch.id}/work-shifts`,
    headers: scopedHeaders,
    payload: {
      timezone: "America/Argentina/Buenos_Aires",
      businessDate: "2026-07-25",
      startsAtUtc: "2026-07-25T12:00:00Z",
      endsAtUtc: "2026-07-25T20:00:00Z",
      laborPolicyVersion: "v1",
    },
  });
  assert.equal(createForeignShiftDenied.statusCode, 404);

  const foreignEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-write-scope",
        employeeCode: "EMP-WRITE-SCOPE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const foreignShift = (
    await app.inject({
      method: "POST",
      url: `/v1/branches/${otherBranch.id}/work-shifts`,
      headers,
      payload: {
        timezone: "America/Argentina/Buenos_Aires",
        businessDate: "2026-07-26",
        startsAtUtc: "2026-07-26T12:00:00Z",
        endsAtUtc: "2026-07-26T20:00:00Z",
        laborPolicyVersion: "v1",
      },
    })
  ).json().data;

  const publishDenied = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${foreignShift.id}/publish`,
    headers: { ...scopedHeaders, "if-match": String(foreignShift.revision) },
  });
  assert.equal(publishDenied.statusCode, 404);

  const assignmentCreateDenied = await app.inject({
    method: "POST",
    url: `/v1/work-shifts/${foreignShift.id}/assignments`,
    headers: scopedHeaders,
    payload: { employmentId: foreignEmployment.id, roleCode: "WAITER" },
  });
  assert.equal(assignmentCreateDenied.statusCode, 404);

  const foreignAssignment = (
    await app.inject({
      method: "POST",
      url: `/v1/work-shifts/${foreignShift.id}/assignments`,
      headers,
      payload: { employmentId: foreignEmployment.id, roleCode: "WAITER" },
    })
  ).json().data;

  for (const url of [
    `/v1/shift-assignments/${foreignAssignment.id}/confirm`,
    `/v1/shift-assignments/${foreignAssignment.id}/cancel`,
  ]) {
    const response = await app.inject({
      method: "POST",
      url,
      headers: scopedHeaders,
      ...(url.endsWith("/cancel") ? { payload: { reason: "Out of scope" } } : {}),
    });
    assert.equal(response.statusCode, 404, url);
  }

  const reassignDenied = await app.inject({
    method: "POST",
    url: `/v1/shift-assignments/${foreignAssignment.id}/reassign`,
    headers: scopedHeaders,
    payload: {
      employmentId: foreignEmployment.id,
      roleCode: "HOST",
      reason: "Out of scope",
      confirmNewAssignment: true,
    },
  });
  assert.equal(reassignDenied.statusCode, 404);

  await app.close();
});

test("Workforce time tracking writes deny resources outside supervisor branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-time-write-scope",
    displayName: "Scoped Manager Time Write",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-time-write-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal time out",
    code: "TOUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const foreignEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-time-write-scope",
        employeeCode: "EMP-TIME-WRITE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockInDenied = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers: scopedHeaders,
    payload: {
      branchId: otherBranch.id,
      employmentId: foreignEmployment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-time-write-scope",
      deviceSequence: 1,
    },
  });
  assert.equal(clockInDenied.statusCode, 404);

  const foreignClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId: otherBranch.id,
      employmentId: foreignEmployment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-time-write-scope",
      deviceSequence: 1,
    },
  });
  assert.equal(foreignClockIn.statusCode, 201);
  const foreignTimeEntry = foreignClockIn.json().data;

  const clockOutDenied = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers: scopedHeaders,
    payload: {
      employmentId: foreignEmployment.id,
      capturedAt: "2026-07-25T18:00:00Z",
    },
  });
  assert.equal(clockOutDenied.statusCode, 404);

  const requestAdjustmentDenied = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${foreignTimeEntry.id}/adjustments`,
    headers: scopedHeaders,
    payload: {
      requesterId: "supervisor-time-write-scope",
      reason: "Out of scope",
      requestedClockInAt: "2026-07-25T11:05:00Z",
    },
  });
  assert.equal(requestAdjustmentDenied.statusCode, 404);

  const requestAdjustment = await app.inject({
    method: "POST",
    url: `/v1/time-entries/${foreignTimeEntry.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-owner",
      reason: "Fix clock-in",
      requestedClockInAt: "2026-07-25T11:05:00Z",
    },
  });
  assert.equal(requestAdjustment.statusCode, 201);
  const foreignAdjustment = requestAdjustment.json().data;

  const approveDenied = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${foreignAdjustment.id}/approve`,
    headers: scopedHeaders,
    payload: { approverId: "manager-out-of-scope" },
  });
  assert.equal(approveDenied.statusCode, 404);

  const rejectDenied = await app.inject({
    method: "POST",
    url: `/v1/time-adjustments/${foreignAdjustment.id}/reject`,
    headers: scopedHeaders,
    payload: { approverId: "manager-out-of-scope" },
  });
  assert.equal(rejectDenied.statusCode, 404);

  await app.close();
});

test("Workforce clock-out denies open time entries outside supervisor branch scope even for multi-branch employments", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-clockout-scope",
    displayName: "Scoped Manager ClockOut",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-clockout-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal clock-out out",
    code: "COUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-clockout-multibranch",
        employeeCode: "EMP-CLOCKOUT-MULTI",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId, otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const foreignClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId: otherBranch.id,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-clockout-scope",
      deviceSequence: 1,
    },
  });
  assert.equal(foreignClockIn.statusCode, 201);

  const deniedClockOut = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-out",
    headers: scopedHeaders,
    payload: {
      employmentId: employment.id,
      capturedAt: "2026-07-25T18:00:00Z",
    },
  });
  assert.equal(deniedClockOut.statusCode, 404);

  await app.close();
});

test("Workforce break writes deny resources outside supervisor branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const scopedManager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-break-write-scope",
    displayName: "Scoped Manager Break Write",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedManager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedManager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "manager-break-write-scope-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedManager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal break out",
    code: "BOUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const foreignEmployment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-break-write-scope",
        employeeCode: "EMP-BREAK-WRITE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const foreignClockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId: otherBranch.id,
      employmentId: foreignEmployment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-write-scope",
      deviceSequence: 1,
    },
  });
  assert.equal(foreignClockIn.statusCode, 201);
  const foreignTimeEntry = foreignClockIn.json().data;

  const breakStartDenied = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers: scopedHeaders,
    payload: {
      timeEntryId: foreignTimeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "policy-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-write-scope",
      deviceSequence: 2,
    },
  });
  assert.equal(breakStartDenied.statusCode, 404);

  const breakStart = await app.inject({
    method: "POST",
    url: "/v1/breaks/start",
    headers,
    payload: {
      timeEntryId: foreignTimeEntry.id,
      breakType: "MEAL",
      paidClassification: "UNPAID",
      laborPolicyVersion: "policy-v1",
      openedAt: "2026-07-25T13:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-break-write-scope",
      deviceSequence: 2,
    },
  });
  assert.equal(breakStart.statusCode, 201);
  const foreignBreakLog = breakStart.json().data;

  const breakEndDenied = await app.inject({
    method: "POST",
    url: `/v1/breaks/${foreignBreakLog.id}/end`,
    headers: scopedHeaders,
    payload: {
      expectedRevision: foreignBreakLog.revision,
      closedAt: "2026-07-25T13:30:00Z",
    },
  });
  assert.equal(breakEndDenied.statusCode, 404);

  const adjustmentCreateDenied = await app.inject({
    method: "POST",
    url: `/v1/breaks/${foreignBreakLog.id}/adjustments`,
    headers: scopedHeaders,
    payload: {
      requesterId: "manager-out-of-scope",
      reason: "Out of scope",
      requestedOpenedAt: "2026-07-25T13:05:00Z",
    },
  });
  assert.equal(adjustmentCreateDenied.statusCode, 404);

  const adjustmentCreate = await app.inject({
    method: "POST",
    url: `/v1/breaks/${foreignBreakLog.id}/adjustments`,
    headers,
    payload: {
      requesterId: "supervisor-owner",
      reason: "Fix break",
      requestedOpenedAt: "2026-07-25T13:05:00Z",
    },
  });
  assert.equal(adjustmentCreate.statusCode, 201);
  const foreignAdjustment = adjustmentCreate.json().data;

  const approveDenied = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${foreignAdjustment.id}/approve`,
    headers: scopedHeaders,
    payload: { approverId: "manager-out-of-scope" },
  });
  assert.equal(approveDenied.statusCode, 404);

  const rejectDenied = await app.inject({
    method: "POST",
    url: `/v1/break-adjustments/${foreignAdjustment.id}/reject`,
    headers: scopedHeaders,
    payload: { approverId: "manager-out-of-scope" },
  });
  assert.equal(rejectDenied.statusCode, 404);

  await app.close();
});

test("Workforce time export requires recent step-up and writes audit evidence", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const exportToken = "time-export-owner-token";
  sessionsOf(container).registerToken(exportToken, {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date("2026-07-25T00:00:00Z"),
    expiresAt: new Date("2026-07-25T23:59:59Z"),
  });
  const headers = { authorization: `Bearer ${exportToken}`, "x-tenant-id": tenantId };

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-time-export",
        employeeCode: "EMP-TIME-EXPORT",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branchId],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  const clockIn = await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-time-export",
      deviceSequence: 1,
    },
  });
  assert.equal(clockIn.statusCode, 201);

  const exportResponse = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/time-exports`,
    headers: { ...headers, "x-step-up-at": "2026-07-25T11:55:00Z" },
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Payroll cutoff export",
      format: "CSV",
    },
  });
  assert.equal(exportResponse.statusCode, 202);
  assert.equal(exportResponse.json().data.status, "REQUESTED");
  assert.equal(exportResponse.json().data.branchId, branchId);
  assert.equal(exportResponse.json().data.manifest.entryCountEstimate, 1);
  assert.equal(exportResponse.json().data.manifest.timeEntryIds.length, 1);

  const listResponse = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/time-exports`,
    headers,
  });
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().data.length, 1);
  assert.equal(listResponse.json().data[0].id, exportResponse.json().data.id);

  const detailResponse = await app.inject({
    method: "GET",
    url: `/v1/time-exports/${exportResponse.json().data.id}`,
    headers,
  });
  assert.equal(detailResponse.statusCode, 200);
  assert.equal(detailResponse.json().data.manifest.entryCountEstimate, 1);

  const auditPage = await container.auditLogs.query({ tenantId, resourceType: "TIME_EXPORT" });
  assert.equal(auditPage.items.length, 1);
  assert.equal(auditPage.items[0]!.action, "CREATE");
  assert.equal(auditPage.items[0]!.resourceId, exportResponse.json().data.id);
  const exportAuditState = auditPage.items[0]!.newState as { reason?: string };
  assert.equal(exportAuditState.reason, "Payroll cutoff export");

  await app.close();
});

test("Workforce time export denies missing or stale step-up", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const exportToken = "time-export-owner-token-stale";
  sessionsOf(container).registerToken(exportToken, {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date("2026-07-25T00:00:00Z"),
    expiresAt: new Date("2026-07-25T23:59:59Z"),
  });
  const headers = { authorization: `Bearer ${exportToken}`, "x-tenant-id": tenantId };

  const missingStepUp = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/time-exports`,
    headers,
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Payroll cutoff export",
    },
  });
  assert.equal(missingStepUp.statusCode, 403);
  assert.equal(missingStepUp.json().type, "step-up-required");

  const staleStepUp = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/time-exports`,
    headers: { ...headers, "x-step-up-at": "2026-07-25T11:40:00Z" },
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Payroll cutoff export",
    },
  });
  assert.equal(staleStepUp.statusCode, 403);
  assert.equal(staleStepUp.json().type, "step-up-required");

  await app.close();
});

test("Workforce time export fails for expired sessions", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);

  const expiredToken = "expired-time-export-token";
  sessionsOf(container).registerToken(expiredToken, {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date("2026-07-25T10:00:00Z"),
    expiresAt: new Date("2026-07-25T11:00:00Z"),
  });
  const expiredHeaders = { authorization: `Bearer ${expiredToken}`, "x-tenant-id": tenantId };

  const exportResponse = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/time-exports`,
    headers: { ...expiredHeaders, "x-step-up-at": "2026-07-25T10:55:00Z" },
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Expired session payroll export",
    },
  });
  assert.equal(exportResponse.statusCode, 401);
  assert.equal(exportResponse.json().type, "session-expired");

  await app.close();
});

test("Workforce time export list and detail deny resources outside branch scope", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();
  const exportOwnerToken = "time-export-scope-owner-token";
  sessionsOf(container).registerToken(exportOwnerToken, {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date("2026-07-25T00:00:00Z"),
    expiresAt: new Date("2026-07-25T23:59:59Z"),
  });
  const headers = { authorization: `Bearer ${exportOwnerToken}`, "x-tenant-id": tenantId };

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal export out",
    code: "EOUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  const employment = (
    await app.inject({
      method: "POST",
      url: "/v1/employments",
      headers,
      payload: {
        personRef: "person-export-scope",
        employeeCode: "EMP-EXPORT-SCOPE",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [otherBranch.id],
        validFrom: "2026-01-01T00:00:00Z",
      },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: "/v1/time-entries/clock-in",
    headers,
    payload: {
      branchId: otherBranch.id,
      employmentId: employment.id,
      capturedAt: "2026-07-25T11:00:00Z",
      timezone: "America/Argentina/Buenos_Aires",
      source: "DEVICE",
      deviceId: "device-export-scope",
      deviceSequence: 1,
    },
  });

  const exportResponse = await app.inject({
    method: "POST",
    url: `/v1/branches/${otherBranch.id}/time-exports`,
    headers: { ...headers, "x-step-up-at": "2026-07-25T11:55:00Z" },
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Scoped export",
    },
  });
  assert.equal(exportResponse.statusCode, 202);

  const scopedAdmin = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "admin-export-scope-deny",
    displayName: "Admin Export Scope Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedAdmin);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedAdmin.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_admin"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const scopedToken = "admin-export-scope-deny-token";
  sessionsOf(container).registerToken(scopedToken, {
    provider: "fixture",
    subject: scopedAdmin.externalIdentityId,
    issuedAt: new Date("2026-07-25T00:00:00Z"),
    expiresAt: new Date("2026-07-25T23:59:59Z"),
  });
  const scopedHeaders = { authorization: `Bearer ${scopedToken}`, "x-tenant-id": tenantId };

  const deniedList = await app.inject({
    method: "GET",
    url: `/v1/branches/${otherBranch.id}/time-exports`,
    headers: scopedHeaders,
  });
  assert.equal(deniedList.statusCode, 404);

  const deniedDetail = await app.inject({
    method: "GET",
    url: `/v1/time-exports/${exportResponse.json().data.id}`,
    headers: scopedHeaders,
  });
  assert.equal(deniedDetail.statusCode, 404);

  await app.close();
});

test("Workforce labor policy review is branch-scoped and does not grant time export", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();

  const manager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-labor-policy-review",
    displayName: "Manager Labor Policy Review",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(manager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: manager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const managerToken = "manager-labor-policy-review-token";
  sessionsOf(container).registerToken(managerToken, {
    provider: "fixture",
    subject: manager.externalIdentityId,
    issuedAt: new Date("2026-07-25T00:00:00Z"),
    expiresAt: new Date("2026-07-25T23:59:59Z"),
  });
  const managerHeaders = { authorization: `Bearer ${managerToken}`, "x-tenant-id": tenantId };

  const reviewResponse = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy?version=labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT`,
    headers: managerHeaders,
  });
  assert.equal(reviewResponse.statusCode, 200);
  assert.equal(reviewResponse.json().data.versionId, "labor-v1|AUTO_CLOSE_BREAK_ON_CLOCK_OUT");
  assert.equal(reviewResponse.json().data.policyCapabilities.breaks.clockOutOpenBreak.mode, "AUTO_CLOSE");
  assert.equal(reviewResponse.json().data.policyCapabilities.dailyMaximums, "NOT_CONFIGURED");

  const exportDenied = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/time-exports`,
    headers: { ...managerHeaders, "x-step-up-at": "2026-07-25T11:55:00Z" },
    payload: {
      from: "2026-07-25T00:00:00Z",
      to: "2026-07-25T23:59:59Z",
      reason: "Manager should not export time",
    },
  });
  assert.equal(exportDenied.statusCode, 403);
  assert.equal(exportDenied.json().type, "insufficient-scope");

  await app.close();
});

test("Workforce labor policy review denies roles without labor policy permission", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "cook-labor-policy-deny",
    displayName: "Cook Labor Policy Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(cook);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: cook.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_cook"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const cookToken = "cook-labor-policy-deny-token";
  sessionsOf(container).registerToken(cookToken, {
    provider: "fixture",
    subject: cook.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const denied = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy?version=labor-v1`,
    headers: { authorization: `Bearer ${cookToken}`, "x-tenant-id": tenantId },
  });
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.json().type, "insufficient-scope");

  await app.close();
});

test("Workforce labor policy manage can create and list versioned policies", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createResponse = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "8ec2ba71-c595-40cb-bde7-75f8f4730857",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-v1",
      consultedAt: "2026-07-20T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-labor-v1",
      reviewerRef: "legal-reviewer-1",
      approvedAt: "2026-07-21T12:00:00Z",
      policyCapabilities: {
        breaks: {
          clockOutOpenBreak: {
            mode: "AUTO_CLOSE",
          },
        },
        dailyMaximums: "NOT_CONFIGURED",
        weeklyMaximums: "NOT_CONFIGURED",
      },
      disclaimer: "Approved internal labor policy reference.",
    },
  });
  assert.equal(createResponse.statusCode, 201);
  assert.equal(createResponse.json().data.id, "8ec2ba71-c595-40cb-bde7-75f8f4730857");

  const listResponse = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
  });
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().data.length, 1);
  assert.equal(listResponse.json().data[0].policyCapabilities.breaks.clockOutOpenBreak.mode, "AUTO_CLOSE");

  const effectiveRead = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy?version=8ec2ba71-c595-40cb-bde7-75f8f4730857`,
    headers,
  });
  assert.equal(effectiveRead.statusCode, 200);
  assert.equal(effectiveRead.json().data.contentHash, "hash-labor-v1");

  const auditPage = await container.auditLogs.query({ tenantId, resourceType: "LABOR_POLICY_VERSION" });
  assert.equal(auditPage.items.length, 1);
  assert.equal(auditPage.items[0]!.action, "CREATE");

  await app.close();
});

test("Workforce labor policy manage is separate from review", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const now = new Date();

  const manager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-labor-policy-manage-deny",
    displayName: "Manager Labor Policy Manage Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(manager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: manager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "manager-labor-policy-manage-deny-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: manager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const deniedCreate = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-v1",
      consultedAt: "2026-07-20T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-labor-v1",
      reviewerRef: "legal-reviewer-1",
      approvedAt: "2026-07-21T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "Approved internal labor policy reference.",
    },
  });
  assert.equal(deniedCreate.statusCode, 403);
  assert.equal(deniedCreate.json().type, "insufficient-scope");

  await app.close();
});

test("Workforce labor policy resolves effective version by date and supersession", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  const createV1 = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "11111111-1111-4111-8111-111111111111",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-v1",
      consultedAt: "2026-06-20T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-labor-v1",
      reviewerRef: "legal-reviewer-1",
      approvedAt: "2026-06-21T12:00:00Z",
      policyCapabilities: {
        breaks: { clockOutOpenBreak: { mode: "REJECT" } },
      },
      disclaimer: "Version 1",
    },
  });
  assert.equal(createV1.statusCode, 201);

  const createV2 = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "22222222-2222-4222-8222-222222222222",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-v2",
      consultedAt: "2026-07-10T12:00:00Z",
      effectiveFrom: "2026-07-15T00:00:00Z",
      contentHash: "hash-labor-v2",
      reviewerRef: "legal-reviewer-2",
      approvedAt: "2026-07-11T12:00:00Z",
      supersedesPolicyVersionId: "11111111-1111-4111-8111-111111111111",
      policyCapabilities: {
        breaks: { clockOutOpenBreak: { mode: "AUTO_CLOSE" } },
      },
      disclaimer: "Version 2",
    },
  });
  assert.equal(createV2.statusCode, 201);

  const effectiveBeforeSupersession = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy?effectiveAt=2026-07-10T10:00:00Z`,
    headers,
  });
  assert.equal(effectiveBeforeSupersession.statusCode, 200);
  assert.equal(effectiveBeforeSupersession.json().data.id, "11111111-1111-4111-8111-111111111111");

  const effectiveAfterSupersession = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy?effectiveAt=2026-07-20T10:00:00Z`,
    headers,
  });
  assert.equal(effectiveAfterSupersession.statusCode, 200);
  assert.equal(effectiveAfterSupersession.json().data.id, "22222222-2222-4222-8222-222222222222");
  assert.equal(
    effectiveAfterSupersession.json().data.policyCapabilities.breaks.clockOutOpenBreak.mode,
    "AUTO_CLOSE",
  );

  await app.close();
});

test("Workforce labor policy activation closes superseded version window", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "33333333-3333-4333-8333-333333333333",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-a",
      consultedAt: "2026-07-01T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-a",
      reviewerRef: "reviewer-a",
      approvedAt: "2026-07-01T12:00:00Z",
      policyCapabilities: {
        breaks: { clockOutOpenBreak: { mode: "REJECT" } },
      },
      disclaimer: "A",
    },
  });

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "44444444-4444-4444-8444-444444444444",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-b",
      consultedAt: "2026-07-10T12:00:00Z",
      effectiveFrom: "2026-07-15T00:00:00Z",
      contentHash: "hash-b",
      reviewerRef: "reviewer-b",
      approvedAt: "2026-07-10T12:00:00Z",
      policyCapabilities: {
        breaks: { clockOutOpenBreak: { mode: "AUTO_CLOSE" } },
      },
      disclaimer: "B",
    },
  });

  const activateResponse = await app.inject({
    method: "POST",
    url: "/v1/labor-policy-versions/44444444-4444-4444-8444-444444444444/activate",
    headers,
    payload: {
      supersedesPolicyVersionId: "33333333-3333-4333-8333-333333333333",
    },
  });
  assert.equal(activateResponse.statusCode, 200);
  assert.equal(activateResponse.json().data.supersedesPolicyVersionId, "33333333-3333-4333-8333-333333333333");

  const listResponse = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
  });
  assert.equal(listResponse.statusCode, 200);
  const superseded = listResponse
    .json()
    .data.find((item: { id: string }) => item.id === "33333333-3333-4333-8333-333333333333");
  assert.equal(superseded.effectiveUntil, "2026-07-14T23:59:59.999Z");

  await app.close();
});

test("Workforce labor policy activation requires manage permission", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "55555555-5555-4555-8555-555555555555",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-c",
      consultedAt: "2026-07-01T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-c",
      reviewerRef: "reviewer-c",
      approvedAt: "2026-07-01T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "C",
    },
  });

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "66666666-6666-4666-8666-666666666666",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-d",
      consultedAt: "2026-07-10T12:00:00Z",
      effectiveFrom: "2026-07-15T00:00:00Z",
      contentHash: "hash-d",
      reviewerRef: "reviewer-d",
      approvedAt: "2026-07-10T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "D",
    },
  });

  const manager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "manager-labor-policy-activate-deny",
    displayName: "Manager Labor Policy Activate Deny",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(manager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: manager.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [branchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "manager-labor-policy-activate-deny-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: manager.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const denied = await app.inject({
    method: "POST",
    url: "/v1/labor-policy-versions/66666666-6666-4666-8666-666666666666/activate",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {
      supersedesPolicyVersionId: "55555555-5555-4555-8555-555555555555",
    },
  });
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.json().type, "insufficient-scope");

  await app.close();
});

test("Workforce labor policy activation denies self supersession", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "77777777-7777-4777-8777-777777777777",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-self",
      consultedAt: "2026-07-01T12:00:00Z",
      effectiveFrom: "2026-07-01T00:00:00Z",
      contentHash: "hash-self",
      reviewerRef: "reviewer-self",
      approvedAt: "2026-07-01T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "self",
    },
  });

  const denied = await app.inject({
    method: "POST",
    url: "/v1/labor-policy-versions/77777777-7777-4777-8777-777777777777/activate",
    headers,
    payload: {
      supersedesPolicyVersionId: "77777777-7777-4777-8777-777777777777",
    },
  });
  assert.equal(denied.statusCode, 400);
  assert.match(denied.json().title, /cannot supersede itself/i);

  await app.close();
});

test("Workforce labor policy create denies invalid superseded policy references", async () => {
  const { container, app } = await buildWorkforceTestApp();
  const { tenantId, branchId } = await getContext(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const otherBranch = {
    id: randomUUID(),
    tenantId,
    brandId: (await container.brands.listByTenant(tenantId))[0]!.id,
    name: "Sucursal policy out",
    code: "POUT",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.branches.save(otherBranch);

  await app.inject({
    method: "POST",
    url: `/v1/branches/${otherBranch.id}/labor-policy-versions`,
    headers,
    payload: {
      id: "88888888-8888-4888-8888-888888888888",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-other",
      consultedAt: "2026-07-01T12:00:00Z",
      effectiveFrom: "2026-07-10T00:00:00Z",
      contentHash: "hash-other",
      reviewerRef: "reviewer-other",
      approvedAt: "2026-07-01T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "other",
    },
  });

  const wrongBranchSupersede = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "99999999-9999-4999-8999-999999999999",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-invalid",
      consultedAt: "2026-07-20T12:00:00Z",
      effectiveFrom: "2026-07-20T00:00:00Z",
      contentHash: "hash-invalid",
      reviewerRef: "reviewer-invalid",
      approvedAt: "2026-07-20T12:00:00Z",
      supersedesPolicyVersionId: "88888888-8888-4888-8888-888888888888",
      policyCapabilities: {},
      disclaimer: "invalid",
    },
  });
  assert.equal(wrongBranchSupersede.statusCode, 404);

  await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-base",
      consultedAt: "2026-07-20T12:00:00Z",
      effectiveFrom: "2026-07-20T00:00:00Z",
      contentHash: "hash-base",
      reviewerRef: "reviewer-base",
      approvedAt: "2026-07-20T12:00:00Z",
      policyCapabilities: {},
      disclaimer: "base",
    },
  });

  const invalidDateSupersede = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/labor-policy-versions`,
    headers,
    payload: {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      jurisdictionCode: "AR-C",
      sourceType: "INTERNAL_APPROVED_REFERENCE",
      sourceRef: "policy-doc-earlier",
      consultedAt: "2026-07-10T12:00:00Z",
      effectiveFrom: "2026-07-10T00:00:00Z",
      contentHash: "hash-earlier",
      reviewerRef: "reviewer-earlier",
      approvedAt: "2026-07-10T12:00:00Z",
      supersedesPolicyVersionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      policyCapabilities: {},
      disclaimer: "earlier",
    },
  });
  assert.equal(invalidDateSupersede.statusCode, 400);
  assert.match(invalidDateSupersede.json().title, /effectivefrom must be later than or equal/i);

  await app.close();
});
