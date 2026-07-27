import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import { createGuest, createReservation } from "@maitre/reservations";

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  const branchId = branches[0]!.id;
  return { tenantId, branchId };
}

function customerHeaders(container: Container, tenantId: string) {
  return { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": tenantId };
}

test("customer routes create/list/detail/cancel own reservations without staff endpoints", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = customerHeaders(container, tenantId);

  const create = await app.inject({
    method: "POST",
    url: "/v1/my/reservations",
    headers,
    payload: {
      branchId,
      partySize: 2,
      startAt: "2026-08-21T20:30:00Z",
      durationMinutes: 90,
      notes: "mesa tranquila",
    },
  });
  assert.equal(create.statusCode, 201);
  assert.equal(create.json().data.status, "PENDING");
  assert.equal(create.json().data.branchId, branchId);
  assert.equal(create.json().data.notes, "mesa tranquila");
  assert.equal("source" in create.json().data, false);

  const list = await app.inject({
    method: "GET",
    url: "/v1/my/reservations",
    headers,
  });
  assert.equal(list.statusCode, 200);
  const createdItem = list.json().data.find((item: { id: string }) => item.id === create.json().data.id);
  assert.ok(createdItem);
  assert.equal(createdItem.branchId, branchId);
  assert.equal("source" in createdItem, false);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/my/reservations/${create.json().data.id}`,
    headers,
  });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().data.id, create.json().data.id);
  assert.equal(detail.json().data.notes, "mesa tranquila");
  assert.equal("source" in detail.json().data, false);

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/my/reservations/${create.json().data.id}/cancel`,
    headers,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal("source" in cancel.json().data, false);

  await app.close();
});

test("customer routes cannot read or cancel another guest reservation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = customerHeaders(container, tenantId);

  const otherGuest = await createGuest(
    { guests: container.guests },
    {
      tenantId,
      displayName: "Another Guest",
      email: "another@example.com",
      consentGiven: false,
    },
  );

  const reservation = await createReservation(
    { reservations: container.reservations, outbox: container.outbox },
    {
      tenantId,
      branchId,
      guestId: otherGuest.id,
      partySize: 4,
      startAt: new Date("2026-08-22T21:00:00Z"),
      durationMinutes: 60,
      source: "PHONE",
      correlationId: "test-customer-foreign-reservation",
    },
  );
  const reservationId = reservation.id;

  const detail = await app.inject({
    method: "GET",
    url: `/v1/my/reservations/${reservationId}`,
    headers,
  });
  assert.equal(detail.statusCode, 404);

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/my/reservations/${reservationId}/cancel`,
    headers,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancel.statusCode, 404);

  await app.close();
});
