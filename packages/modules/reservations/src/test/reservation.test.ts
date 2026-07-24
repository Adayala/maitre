import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  seatReservation,
  markNoShow,
  completeReservation,
  CapacityUnavailableError,
  InvalidReservationTransitionError,
} from "../index.js";
import { FakeReservationRepository, FakeOutboxRepository } from "./fakes.js";

function deps() {
  return { reservations: new FakeReservationRepository(), outbox: new FakeOutboxRepository() };
}

const TABLES = [{ id: "table-1", capacity: 4 }];

test("createReservation creates PENDING and emits created event", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  assert.equal(reservation.status, "PENDING");
  assert.equal(d.outbox.records.length, 1);
  assert.equal(d.outbox.records[0]?.eventName, "reservations.reservation.created.v1");
});

test("confirmReservation moves PENDING -> CONFIRMED and assigns a table", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  const confirmed = await confirmReservation(d, {
    tenantId: "t1",
    reservationId: reservation.id,
    tables: TABLES,
  });
  assert.equal(confirmed.status, "CONFIRMED");
  assert.deepEqual(confirmed.tableIds, ["table-1"]);
  assert.equal(d.outbox.records.at(-1)?.eventName, "reservations.reservation.confirmed.v1");
});

test("confirmReservation rejects when no table has capacity", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 10,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  await assert.rejects(
    () => confirmReservation(d, { tenantId: "t1", reservationId: reservation.id, tables: TABLES }),
    CapacityUnavailableError,
  );
});

test("confirmReservation rejects overlapping window on the only table", async () => {
  const d = deps();
  const r1 = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  await confirmReservation(d, { tenantId: "t1", reservationId: r1.id, tables: TABLES });

  const r2 = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:30:00Z"),
    durationMinutes: 90,
  });
  await assert.rejects(
    () => confirmReservation(d, { tenantId: "t1", reservationId: r2.id, tables: TABLES }),
    CapacityUnavailableError,
  );
});

test("cancelReservation moves PENDING -> CANCELLED and emits event", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  const cancelled = await cancelReservation(d, {
    tenantId: "t1",
    reservationId: reservation.id,
    reasonCode: "GUEST_REQUEST",
  });
  assert.equal(cancelled.status, "CANCELLED");
  assert.equal(d.outbox.records.at(-1)?.eventName, "reservations.reservation.cancelled.v1");
});

test("full lifecycle: PENDING -> CONFIRMED -> SEATED -> COMPLETED", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  await confirmReservation(d, { tenantId: "t1", reservationId: reservation.id, tables: TABLES });
  const seated = await seatReservation(d, {
    tenantId: "t1",
    reservationId: reservation.id,
    visitId: "visit-1",
  });
  assert.equal(seated.status, "SEATED");
  assert.equal(seated.visitId, "visit-1");
  const completed = await completeReservation(d, { tenantId: "t1", reservationId: reservation.id });
  assert.equal(completed.status, "COMPLETED");
});

test("markNoShow requires CONFIRMED and rejects from PENDING", async () => {
  const d = deps();
  const reservation = await createReservation(d, {
    tenantId: "t1",
    branchId: "b1",
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 90,
  });
  await assert.rejects(
    () => markNoShow(d, { tenantId: "t1", reservationId: reservation.id, reason: "no reason" }),
    InvalidReservationTransitionError,
  );
  await confirmReservation(d, { tenantId: "t1", reservationId: reservation.id, tables: TABLES });
  const noShow = await markNoShow(d, {
    tenantId: "t1",
    reservationId: reservation.id,
    reason: "did not arrive",
  });
  assert.equal(noShow.status, "NO_SHOW");
});
