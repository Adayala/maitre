import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addWaitlistEntry,
  notifyWaitlistEntry,
  seatWaitlistEntry,
  cancelWaitlistEntry,
  expireWaitlistEntry,
  setWaitlistPriorityOverride,
  sortWaitlistEntries,
  InvalidWaitlistTransitionError,
} from "../index.js";
import { FakeWaitlistEntryRepository } from "./fakes.js";

function deps() {
  return { waitlistEntries: new FakeWaitlistEntryRepository() };
}

test("addWaitlistEntry creates WAITING with server-assigned arrivedAt", async () => {
  const d = deps();
  const entry = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 2 });
  assert.equal(entry.status, "WAITING");
  assert.equal(entry.priorityOverride, 0);
});

test("notify -> seat happy path links a Visit", async () => {
  const d = deps();
  const entry = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 2 });
  const notified = await notifyWaitlistEntry(d, { tenantId: "t1", entryId: entry.id });
  assert.equal(notified.status, "NOTIFIED");
  const seated = await seatWaitlistEntry(d, { tenantId: "t1", entryId: entry.id, visitId: "visit-1" });
  assert.equal(seated.status, "SEATED");
  assert.equal(seated.visitId, "visit-1");
});

test("cancel/expire are terminal and reject further transitions", async () => {
  const d = deps();
  const entry = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 2 });
  await cancelWaitlistEntry(d, { tenantId: "t1", entryId: entry.id, reason: "left" });
  await assert.rejects(
    () => notifyWaitlistEntry(d, { tenantId: "t1", entryId: entry.id }),
    InvalidWaitlistTransitionError,
  );

  const entry2 = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 2 });
  await expireWaitlistEntry(d, { tenantId: "t1", entryId: entry2.id });
  await assert.rejects(() =>
    seatWaitlistEntry(d, { tenantId: "t1", entryId: entry2.id, visitId: "visit-1" }),
  );
});

test("FIFO ordering by arrivedAt, with priorityOverride sorting ahead", async () => {
  const d = deps();
  const first = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 2 });
  const second = await addWaitlistEntry(d, { tenantId: "t1", branchId: "b1", partySize: 4 });
  // force distinct arrival times deterministically
  await d.waitlistEntries.save({ ...first, arrivedAt: new Date("2026-08-01T10:00:00Z") });
  await d.waitlistEntries.save({ ...second, arrivedAt: new Date("2026-08-01T10:05:00Z") });

  const plainOrder = sortWaitlistEntries([
    (await d.waitlistEntries.findById("t1", second.id))!,
    (await d.waitlistEntries.findById("t1", first.id))!,
  ]);
  assert.deepEqual(
    plainOrder.map((e) => e.id),
    [first.id, second.id],
  );

  const overridden = await setWaitlistPriorityOverride(d, {
    tenantId: "t1",
    entryId: second.id,
    priorityOverride: 1,
    reason: "large party accommodation",
  });
  const overriddenOrder = sortWaitlistEntries([
    (await d.waitlistEntries.findById("t1", first.id))!,
    overridden,
  ]);
  assert.deepEqual(
    overriddenOrder.map((e) => e.id),
    [second.id, first.id],
  );
});
