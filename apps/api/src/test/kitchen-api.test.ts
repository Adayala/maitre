import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-098..110 §5 — Fastify inject() coverage for the Kitchen domain API.
const DEMO_TABLE_ID = "00000000-0000-0000-0000-000000000005";
const DEMO_PRODUCT_ID = "00000000-0000-0000-0000-00000000000b";
const DEMO_STATION_ID = "00000000-0000-0000-0000-00000000000d";

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  return { tenantId, branchId: branches[0]!.id };
}

function ownerHeaders(container: Container, tenantId: string) {
  return { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": tenantId };
}

async function submitOrderWithItems(
  app: Awaited<ReturnType<typeof buildApp>>,
  headers: Record<string, string>,
  branchId: string,
  quantity = 1,
) {
  const visit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [DEMO_TABLE_ID], guestCount: 2 },
  });
  const visitId = visit.json().data.id as string;
  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity } });
  const submit = await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });
  return { orderId: order.id as string, commands: submit.json().data.commands as { id: string; status: string }[] };
}

test("submit routes Commands to the seeded demo Station in RECEIVED", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const { commands } = await submitOrderWithItems(app, headers, branchId);
  assert.equal(commands.length, 1);
  assert.equal(commands[0]!.status, "RECEIVED");

  const command = (await app.inject({ method: "GET", url: `/v1/kitchen/commands/${commands[0]!.id}`, headers })).json().data;
  assert.equal(command.stationId, DEMO_STATION_ID);
  await app.close();
});

test("command lifecycle: claim, start (in-progress event), hold/resume, mark-ready, complete-handoff", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { commands } = await submitOrderWithItems(app, headers, branchId);
  const id = commands[0]!.id;

  const claim = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/claim`, headers, payload: {} });
  assert.equal(claim.json().data.status, "CLAIMED");
  assert.ok(claim.json().data.ownerActorRef);

  const start = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/start`, headers, payload: {} });
  assert.equal(start.json().data.status, "IN_PROGRESS");

  const hold = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/hold`, headers, payload: {} });
  assert.equal(hold.json().data.status, "ON_HOLD");
  const resume = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/resume`, headers, payload: {} });
  assert.equal(resume.json().data.status, "IN_PROGRESS");

  const ready = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/mark-ready`, headers, payload: {} });
  assert.equal(ready.json().data.status, "READY");
  const done = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/complete-handoff`, headers, payload: {} });
  assert.equal(done.json().data.status, "COMPLETED");
  await app.close();
});

test("invalid transition (mark-ready before start) returns 409; unknown id 404", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { commands } = await submitOrderWithItems(app, headers, branchId);

  const bad = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${commands[0]!.id}/mark-ready`, headers, payload: {} });
  assert.equal(bad.statusCode, 409);

  const missing = await app.inject({ method: "GET", url: `/v1/kitchen/commands/${randomUUID()}`, headers });
  assert.equal(missing.statusCode, 404);
  await app.close();
});

test("cancel a command leaves the Order untouched (production compensation only)", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { orderId, commands } = await submitOrderWithItems(app, headers, branchId);

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${commands[0]!.id}/cancel`,
    headers,
    payload: { reason: "86_INGREDIENT" },
  });
  assert.equal(cancel.json().data.status, "CANCELLED");
  const order = (await app.inject({ method: "GET", url: `/v1/orders/${orderId}`, headers })).json().data;
  assert.equal(order.status, "SUBMITTED");
  await app.close();
});

test("create a second station, transfer a command to it", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { commands } = await submitOrderWithItems(app, headers, branchId);

  const station = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/kitchen/stations`,
    headers,
    payload: { code: "FRY", displayName: "Fry Station", capabilities: ["FRY"] },
  });
  assert.equal(station.statusCode, 201);
  const targetStationId = station.json().data.id;

  const transfer = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${commands[0]!.id}/transfer`,
    headers,
    payload: { targetStationId, reason: "load balance" },
  });
  assert.equal(transfer.json().data.stationId, targetStationId);
  assert.equal(transfer.json().data.transferHistory.length, 1);
  await app.close();
});

test("reprioritize changes priority and reorders the production queue", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  // Two orders under a single Visit (one demo table), each dispatching a Command.
  const visit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [DEMO_TABLE_ID], guestCount: 2 },
  });
  const visitId = visit.json().data.id as string;
  const submitOne = async () => {
    const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
    await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity: 1 } });
    return (await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} })).json().data.commands[0];
  };
  const first = await submitOne();
  const second = await submitOne();

  // Bump the second command's priority so it jumps to the front of the queue.
  const bump = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${second.id}/reprioritize`,
    headers,
    payload: { priority: 10, reason: "VIP" },
  });
  assert.equal(bump.json().data.priority, 10);

  const queue = (await app.inject({
    method: "GET",
    url: `/v1/kitchen/stations/${DEMO_STATION_ID}/production-queue`,
    headers,
  })).json().data;
  assert.equal(queue.commands[0].id, second.id);
  assert.ok(queue.commands.some((c: { id: string }) => c.id === first.id));
  await app.close();
});

test("alert evaluate raises a stale command alert; acknowledge/escalate/resolve", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { commands } = await submitOrderWithItems(app, headers, branchId);

  // Manufacture a stale-before-start command by back-dating receivedAt > 15 min.
  const command = await container.commands.findById(tenantId, commands[0]!.id);
  await container.commands.save({ ...command!, receivedAt: new Date(Date.now() - 20 * 60_000) });

  const raised = await app.inject({ method: "POST", url: `/v1/branches/${branchId}/kitchen/alerts/evaluate`, headers, payload: {} });
  assert.equal(raised.statusCode, 200);
  assert.equal(raised.json().data.length, 1);
  const alertId = raised.json().data[0].id;
  assert.equal(raised.json().data[0].status, "OPEN");

  const list = await app.inject({ method: "GET", url: `/v1/branches/${branchId}/kitchen/alerts`, headers });
  assert.equal(list.json().data.length, 1);

  const ack = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/acknowledge`, headers, payload: {} });
  assert.equal(ack.json().data.status, "ACKNOWLEDGED");
  const esc = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/escalate`, headers, payload: {} });
  assert.equal(esc.json().data.status, "ESCALATED");
  assert.equal(esc.json().data.escalationLevel, 1);
  const resolve = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/resolve`, headers, payload: { reasonCode: "HANDLED" } });
  assert.equal(resolve.json().data.status, "RESOLVED");
  await app.close();
});

test("deactivating a station with active commands returns 409", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  await submitOrderWithItems(app, headers, branchId);

  const res = await app.inject({ method: "POST", url: `/v1/kitchen/stations/${DEMO_STATION_ID}/deactivate`, headers, payload: {} });
  assert.equal(res.statusCode, 409);
  await app.close();
});

test("403 without permission (cashier), 404 for unknown station", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-kitchen",
    displayName: "Demo Cashier",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(cashier);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: cashier.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_cashier"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "cashier-token-kitchen";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cashier-kitchen",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  // CASHIER has no kitchen permissions.
  const forbidden = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/kitchen/stations`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(forbidden.statusCode, 403);

  const missing = await app.inject({
    method: "GET",
    url: `/v1/kitchen/stations/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(missing.statusCode, 404);
  await app.close();
});
