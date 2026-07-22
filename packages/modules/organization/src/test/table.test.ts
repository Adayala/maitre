import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertValidTableCapacity,
  computeTableStatus,
  canAcceptReservationOrVisit,
  InvalidTableCapacityError,
  TableCapacityExceedsSalonError,
} from "../domain/table.js";

test("assertValidTableCapacity accepts capacity within [1,20] and <= salon capacity", () => {
  assert.doesNotThrow(() => assertValidTableCapacity(4, 40));
  assert.doesNotThrow(() => assertValidTableCapacity(1, 40));
  assert.doesNotThrow(() => assertValidTableCapacity(20, 40));
});

test("assertValidTableCapacity rejects capacity below 1 or above 20", () => {
  assert.throws(() => assertValidTableCapacity(0, 40), InvalidTableCapacityError);
  assert.throws(() => assertValidTableCapacity(21, 40), InvalidTableCapacityError);
});

test("assertValidTableCapacity rejects non-integer capacity", () => {
  assert.throws(() => assertValidTableCapacity(4.5, 40), InvalidTableCapacityError);
});

test("assertValidTableCapacity rejects capacity exceeding salon capacity", () => {
  assert.throws(
    () => assertValidTableCapacity(10, 8),
    TableCapacityExceedsSalonError,
  );
});

test("computeTableStatus precedence: BLOCKED wins over everything", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: true,
      isCleaning: true,
      hasPayingVisit: true,
      hasOpenVisit: true,
      hasFutureReservation: true,
    }),
    "BLOCKED",
  );
});

test("computeTableStatus precedence: CLEANING wins over PAYING/OCCUPIED/RESERVED", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: false,
      isCleaning: true,
      hasPayingVisit: true,
      hasOpenVisit: true,
      hasFutureReservation: true,
    }),
    "CLEANING",
  );
});

test("computeTableStatus precedence: PAYING wins over OCCUPIED/RESERVED", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: false,
      isCleaning: false,
      hasPayingVisit: true,
      hasOpenVisit: true,
      hasFutureReservation: true,
    }),
    "PAYING",
  );
});

test("computeTableStatus: OCCUPIED when only an open visit exists", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: false,
      isCleaning: false,
      hasPayingVisit: false,
      hasOpenVisit: true,
      hasFutureReservation: true,
    }),
    "OCCUPIED",
  );
});

test("computeTableStatus: RESERVED when only a future reservation exists", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: false,
      isCleaning: false,
      hasPayingVisit: false,
      hasOpenVisit: false,
      hasFutureReservation: true,
    }),
    "RESERVED",
  );
});

test("computeTableStatus: AVAILABLE as default", () => {
  assert.equal(
    computeTableStatus({
      isBlocked: false,
      isCleaning: false,
      hasPayingVisit: false,
      hasOpenVisit: false,
      hasFutureReservation: false,
    }),
    "AVAILABLE",
  );
});

test("canAcceptReservationOrVisit is false only for BLOCKED", () => {
  assert.equal(canAcceptReservationOrVisit("BLOCKED"), false);
  assert.equal(canAcceptReservationOrVisit("AVAILABLE"), true);
  assert.equal(canAcceptReservationOrVisit("CLEANING"), true);
});
