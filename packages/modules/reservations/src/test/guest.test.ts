import { test } from "node:test";
import assert from "node:assert/strict";
import { createGuest, updateGuest, anonymizeGuest } from "../index.js";
import { FakeGuestRepository } from "./fakes.js";

function deps() {
  return { guests: new FakeGuestRepository() };
}

test("createGuest stores a simple profile", async () => {
  const d = deps();
  const guest = await createGuest(d, {
    tenantId: "t1",
    displayName: "Jane Doe",
    email: "jane@example.com",
    consentGiven: true,
  });
  assert.equal(guest.status, "ACTIVE");
  assert.equal(guest.email, "jane@example.com");
});

test("updateGuest patches fields and bumps revision", async () => {
  const d = deps();
  const guest = await createGuest(d, { tenantId: "t1", displayName: "Jane Doe" });
  const updated = await updateGuest(d, { tenantId: "t1", guestId: guest.id, phone: "+541100000000" });
  assert.equal(updated.phone, "+541100000000");
  assert.equal(updated.revision, guest.revision + 1);
});

test("anonymizeGuest clears PII fields and marks ANONYMIZED", async () => {
  const d = deps();
  const guest = await createGuest(d, {
    tenantId: "t1",
    displayName: "Jane Doe",
    email: "jane@example.com",
    phone: "+541100000000",
    notes: "allergic to peanuts",
  });
  const anonymized = await anonymizeGuest(d, { tenantId: "t1", guestId: guest.id });
  assert.equal(anonymized.status, "ANONYMIZED");
  assert.equal(anonymized.email, undefined);
  assert.equal(anonymized.phone, undefined);
  assert.equal(anonymized.notes, undefined);
  assert.equal(anonymized.locale, undefined);
  assert.equal(anonymized.displayName, "Anonymized Guest");
  assert.equal(anonymized.consentGiven, false);
});
