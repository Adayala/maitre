import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkShift,
  publishWorkShift,
  startWorkShift,
  completeWorkShift,
  cancelWorkShift,
  ActiveWorkShiftConflictError,
  InvalidWorkShiftTransitionError,
} from "../index.js";
import { FakeWorkShiftRepository } from "./fakes.js";

test("WorkShift lifecycle: draft -> published -> in_progress -> completed", async () => {
  const workShifts = new FakeWorkShiftRepository();
  const draft = await createWorkShift(
    { workShifts },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      branchId: "22222222-2222-2222-2222-222222222222",
      timezone: "America/Argentina/Buenos_Aires",
      businessDate: "2026-07-24",
      startsAtUtc: new Date("2026-07-24T12:00:00Z"),
      endsAtUtc: new Date("2026-07-24T20:00:00Z"),
      laborPolicyVersion: "labor-v1",
    },
  );
  assert.equal(draft.status, "DRAFT");

  const published = await publishWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T12:10:00Z"));
  assert.equal(published.status, "PUBLISHED");

  const started = await startWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T12:20:00Z"));
  assert.equal(started.status, "IN_PROGRESS");

  const completed = await completeWorkShift({ workShifts }, draft.tenantId, draft.id, new Date("2026-07-24T20:01:00Z"));
  assert.equal(completed.status, "COMPLETED");
});

test("WorkShift publish rejects incompatible active shift in same branch", async () => {
  const workShifts = new FakeWorkShiftRepository();
  const a = await createWorkShift(
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
  await publishWorkShift({ workShifts }, a.tenantId, a.id);

  const b = await createWorkShift(
    { workShifts },
    {
      tenantId: a.tenantId,
      branchId: a.branchId,
      timezone: "UTC",
      businessDate: "2026-07-24",
      startsAtUtc: new Date("2026-07-24T12:00:00Z"),
      endsAtUtc: new Date("2026-07-24T16:00:00Z"),
      laborPolicyVersion: "labor-v1",
    },
  );
  await assert.rejects(() => publishWorkShift({ workShifts }, b.tenantId, b.id), ActiveWorkShiftConflictError);
});

test("WorkShift cannot cancel after start", async () => {
  const workShifts = new FakeWorkShiftRepository();
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
  await publishWorkShift({ workShifts }, shift.tenantId, shift.id);
  await startWorkShift({ workShifts }, shift.tenantId, shift.id);
  await assert.rejects(() => cancelWorkShift({ workShifts }, shift.tenantId, shift.id), InvalidWorkShiftTransitionError);
});
