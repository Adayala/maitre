import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-071/072/073/074/075/080 §5 — Fastify inject() coverage for the
// Reservations domain API.

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

test("Reservation lifecycle: create, confirm, seat", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: ownerHeaders(container, tenantId),
    payload: { partySize: 2, startAt: "2026-08-01T20:00:00Z", durationMinutes: 90 },
  });
  assert.equal(create.statusCode, 201);
  const reservation = create.json().data;
  assert.equal(reservation.status, "PENDING");

  const confirm = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/confirm`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(confirm.statusCode, 200);
  assert.equal(confirm.json().data.status, "CONFIRMED");

  const seat = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/seat`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(seat.statusCode, 200);
  assert.equal(seat.json().data.status, "SEATED");
  assert.ok(seat.json().data.visitId);
  await app.close();
});

test("Reservation cancel on a different reservation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: ownerHeaders(container, tenantId),
    payload: { partySize: 4, startAt: "2026-08-02T20:00:00Z", durationMinutes: 60 },
  });
  const reservation = create.json().data;

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/cancel`,
    headers: ownerHeaders(container, tenantId),
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  await app.close();
});

test("403 without permission, 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook-reservations",
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
  const token = "cook-token-reservations";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook-reservations",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { partySize: 2, startAt: "2026-08-01T20:00:00Z", durationMinutes: 60 },
  });
  assert.equal(forbidden.statusCode, 403);

  const notFound = await app.inject({
    method: "GET",
    url: `/v1/reservations/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notFound.statusCode, 404);
  await app.close();
});

test("Waitlist: add, notify, seat, cancel", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const add = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/waitlist-entries`,
    headers: ownerHeaders(container, tenantId),
    payload: { partySize: 2 },
  });
  assert.equal(add.statusCode, 201);
  const entry = add.json().data;
  assert.equal(entry.status, "WAITING");

  const notify = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry.id}/notify`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notify.statusCode, 200);
  assert.equal(notify.json().data.status, "NOTIFIED");

  const seat = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry.id}/seat`,
    headers: ownerHeaders(container, tenantId),
    payload: { tableIds: [randomUUID()] },
  });
  assert.equal(seat.statusCode, 200);
  assert.equal(seat.json().data.status, "SEATED");

  const add2 = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/waitlist-entries`,
    headers: ownerHeaders(container, tenantId),
    payload: { partySize: 3 },
  });
  const entry2 = add2.json().data;
  const cancel = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry2.id}/cancel`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "left" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  await app.close();
});

test("Guest: create and anonymize", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: { displayName: "Jane Doe", email: "jane@example.com" },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;

  const anonymize = await app.inject({
    method: "POST",
    url: `/v1/guests/${guest.id}/anonymizations`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(anonymize.statusCode, 200);
  assert.equal(anonymize.json().data.status, "ANONYMIZED");
  assert.equal(anonymize.json().data.email, undefined);
  await app.close();
});

test("Availability GET returns free tables", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const availability = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-01T20:00:00Z&durationMinutes=60`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(availability.statusCode, 200);
  const data = availability.json().data;
  assert.equal(data.available, true);
  assert.ok(data.freeTableIds.length > 0);
  await app.close();
});
