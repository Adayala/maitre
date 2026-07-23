import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createServicePeriod,
  openServicePeriod,
  beginCloseServicePeriod,
  closeServicePeriod,
  cancelPlannedServicePeriod,
  ConflictingServicePeriodError,
  computeTableStatus,
} from "../index.js";
import { FakeServicePeriodRepository } from "./fakes.js";

test("only one OPEN/CLOSING ServicePeriod per branch", async () => {
  const d = { servicePeriods: new FakeServicePeriodRepository() };
  const lunch = await createServicePeriod(d, {
    tenantId: "t1",
    branchId: "b1",
    businessDate: "2026-07-23",
    name: "Lunch",
    type: "LUNCH",
  });
  const dinner = await createServicePeriod(d, {
    tenantId: "t1",
    branchId: "b1",
    businessDate: "2026-07-23",
    name: "Dinner",
    type: "DINNER",
  });

  const openedLunch = await openServicePeriod(d, { tenantId: "t1", servicePeriodId: lunch.id });
  assert.equal(openedLunch.status, "OPEN");

  await assert.rejects(
    () => openServicePeriod(d, { tenantId: "t1", servicePeriodId: dinner.id }),
    ConflictingServicePeriodError,
  );

  await beginCloseServicePeriod(d, { tenantId: "t1", servicePeriodId: lunch.id });
  const closed = await closeServicePeriod(d, { tenantId: "t1", servicePeriodId: lunch.id });
  assert.equal(closed.status, "CLOSED");

  const openedDinner = await openServicePeriod(d, { tenantId: "t1", servicePeriodId: dinner.id });
  assert.equal(openedDinner.status, "OPEN");
});

test("cancel-planned only allowed from PLANNED", async () => {
  const d = { servicePeriods: new FakeServicePeriodRepository() };
  const period = await createServicePeriod(d, {
    tenantId: "t1",
    branchId: "b1",
    businessDate: "2026-07-23",
    name: "Breakfast",
    type: "BREAKFAST",
  });
  const cancelled = await cancelPlannedServicePeriod(d, { tenantId: "t1", servicePeriodId: period.id });
  assert.equal(cancelled.status, "CANCELLED");
});

test("computeTableStatus: AVAILABLE with no occupancy, OCCUPIED with ACTIVE, PAYING with PAYMENT_PENDING check", () => {
  const now = new Date();
  const available = computeTableStatus({ tableId: "table-1", occupancies: [], now });
  assert.equal(available.status, "AVAILABLE");

  const occupancy = {
    id: "occ-1",
    tenantId: "t1",
    branchId: "b1",
    tableId: "table-1",
    visitId: "visit-1",
    guestCount: 2,
    status: "ACTIVE" as const,
    startedAt: now,
    revision: 1,
  };
  const occupied = computeTableStatus({ tableId: "table-1", occupancies: [occupancy], now });
  assert.equal(occupied.status, "OCCUPIED");

  const checksByVisitId = new Map([
    [
      "visit-1",
      {
        id: "check-1",
        tenantId: "t1",
        branchId: "b1",
        visitId: "visit-1",
        currency: "ARS",
        lines: [],
        adjustments: [],
        status: "PAYMENT_PENDING" as const,
        revision: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ]);
  const paying = computeTableStatus({ tableId: "table-1", occupancies: [occupancy], checksByVisitId, now });
  assert.equal(paying.status, "PAYING");
});
