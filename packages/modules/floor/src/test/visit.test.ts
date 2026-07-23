import { test } from "node:test";
import assert from "node:assert/strict";
import {
  openVisit,
  requestCloseVisit,
  closeVisit,
  cancelVisit,
  reopenVisit,
  TableAlreadyOccupiedError,
} from "../index.js";
import {
  FakeVisitRepository,
  FakeOccupancyRepository,
  FakeCheckRepository,
  FakePaymentRepository,
  FakeOutboxRepository,
} from "./fakes.js";

function deps() {
  return {
    visits: new FakeVisitRepository(),
    occupancies: new FakeOccupancyRepository(),
    checks: new FakeCheckRepository(),
    payments: new FakePaymentRepository(),
    outbox: new FakeOutboxRepository(),
  };
}

test("openVisit opens a Visit and seats its tables", async () => {
  const d = deps();
  const visit = await openVisit(d, {
    tenantId: "t1",
    branchId: "b1",
    tableIds: ["table-1"],
    guestCount: 2,
  });
  assert.equal(visit.status, "OPEN");
  const occ = await d.occupancies.findActiveByTable("t1", "table-1");
  assert.ok(occ);
  assert.equal(occ?.visitId, visit.id);
  assert.equal(d.outbox.records.length, 1);
  assert.equal(d.outbox.records[0]?.eventName, "floor.visit.opened.v1");
});

test("openVisit rejects double-booking a Table", async () => {
  const d = deps();
  await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  await assert.rejects(
    () => openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 3 }),
    TableAlreadyOccupiedError,
  );
});

test("Visit close requires a settled Check", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  await requestCloseVisit(d, { tenantId: "t1", visitId: visit.id });

  await d.checks.save({
    id: "check-1",
    tenantId: "t1",
    branchId: "b1",
    visitId: visit.id,
    currency: "ARS",
    lines: [{ id: "l1", description: "Item", amountMinorUnits: 1000 }],
    adjustments: [],
    status: "OPEN",
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await assert.rejects(() => closeVisit(d, { tenantId: "t1", visitId: visit.id }));

  const check = await d.checks.findById("t1", "check-1");
  await d.checks.save({ ...check!, status: "SETTLED" });

  const closed = await closeVisit(d, { tenantId: "t1", visitId: visit.id });
  assert.equal(closed.status, "CLOSED");
  const occ = await d.occupancies.listByVisit("t1", visit.id);
  assert.ok(occ.every((o) => o.status === "CLOSED"));
});

test("cancelVisit only allowed before a Check exists", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  const cancelled = await cancelVisit(d, { tenantId: "t1", visitId: visit.id, reason: "no-show" });
  assert.equal(cancelled.status, "CANCELLED");
});

test("reopenVisit moves CLOSING back to OPEN", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  await requestCloseVisit(d, { tenantId: "t1", visitId: visit.id });
  const reopened = await reopenVisit(d, { tenantId: "t1", visitId: visit.id, reason: "manager correction" });
  assert.equal(reopened.status, "OPEN");
});
