import { test } from "node:test";
import assert from "node:assert/strict";
import { createReservationPreference, isRequirement } from "../index.js";
import { FakeReservationPreferenceRepository } from "./fakes.js";

test("createReservationPreference persists guest and reservation scoped preferences", async () => {
  const preferences = new FakeReservationPreferenceRepository();
  const now = new Date("2026-08-01T10:00:00Z");

  const guestPreference = await createReservationPreference(
    { preferences, now: () => now },
    {
      tenantId: "t1",
      subjectType: "GUEST",
      subjectId: "guest-1",
      code: "SEATING_ZONE",
      value: "PATIO",
      kind: "PREFERENCE",
      notes: "quiet area if possible",
    },
  );

  assert.equal(guestPreference.revision, 1);
  assert.equal(guestPreference.subjectType, "GUEST");
  assert.equal(guestPreference.subjectId, "guest-1");
  assert.equal(guestPreference.code, "SEATING_ZONE");
  assert.equal(guestPreference.value, "PATIO");
  assert.equal(guestPreference.kind, "PREFERENCE");
  assert.equal(isRequirement(guestPreference), false);

  const reservationRequirement = await createReservationPreference(
    { preferences, now: () => now },
    {
      tenantId: "t1",
      subjectType: "RESERVATION",
      subjectId: "reservation-1",
      code: "ACCESSIBILITY",
      value: "WHEELCHAIR_ACCESS",
      kind: "REQUIREMENT",
    },
  );

  assert.equal(reservationRequirement.subjectType, "RESERVATION");
  assert.equal(reservationRequirement.kind, "REQUIREMENT");
  assert.equal(isRequirement(reservationRequirement), true);

  const guestScoped = await preferences.listBySubject("t1", "GUEST", "guest-1");
  assert.equal(guestScoped.length, 1);
  assert.equal(guestScoped[0]?.id, guestPreference.id);

  const reservationScoped = await preferences.listBySubject("t1", "RESERVATION", "reservation-1");
  assert.equal(reservationScoped.length, 1);
  assert.equal(reservationScoped[0]?.id, reservationRequirement.id);
});
