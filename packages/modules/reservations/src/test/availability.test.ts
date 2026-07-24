import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAvailability } from "../index.js";

test("calculateAvailability returns free tables with sufficient capacity and no overlap", () => {
  const result = calculateAvailability({
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 60,
    tables: [
      { id: "t1", capacity: 2 },
      { id: "t2", capacity: 4 },
    ],
    reservedWindows: new Map(),
    activeOccupancyTableIds: new Set(),
  });
  assert.equal(result.available, true);
  assert.deepEqual(result.freeTableIds.sort(), ["t1", "t2"]);
});

test("calculateAvailability excludes tables under capacity", () => {
  const result = calculateAvailability({
    partySize: 5,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 60,
    tables: [{ id: "t1", capacity: 4 }],
    reservedWindows: new Map(),
    activeOccupancyTableIds: new Set(),
  });
  assert.equal(result.available, false);
});

test("calculateAvailability excludes tables with an overlapping reserved window", () => {
  const result = calculateAvailability({
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 60,
    tables: [{ id: "t1", capacity: 4 }],
    reservedWindows: new Map([
      ["t1", [{ start: new Date("2026-08-01T20:30:00Z"), end: new Date("2026-08-01T21:30:00Z") }]],
    ]),
    activeOccupancyTableIds: new Set(),
  });
  assert.equal(result.available, false);
});

test("calculateAvailability allows back-to-back non-overlapping windows [start,end)", () => {
  const result = calculateAvailability({
    partySize: 2,
    startAt: new Date("2026-08-01T21:00:00Z"),
    durationMinutes: 60,
    tables: [{ id: "t1", capacity: 4 }],
    reservedWindows: new Map([
      ["t1", [{ start: new Date("2026-08-01T20:00:00Z"), end: new Date("2026-08-01T21:00:00Z") }]],
    ]),
    activeOccupancyTableIds: new Set(),
  });
  assert.equal(result.available, true);
});

test("calculateAvailability excludes tables with an active Floor Occupancy", () => {
  const result = calculateAvailability({
    partySize: 2,
    startAt: new Date("2026-08-01T20:00:00Z"),
    durationMinutes: 60,
    tables: [{ id: "t1", capacity: 4 }],
    reservedWindows: new Map(),
    activeOccupancyTableIds: new Set(["t1"]),
  });
  assert.equal(result.available, false);
});
