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
  assert.deepEqual(
    new Set(Object.keys(command as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(command.stationId, DEMO_STATION_ID);
  assert.equal(command.status, "RECEIVED");
  assert.equal(command.revision, 1);
  assert.deepEqual(
    new Set(Object.keys(command.payload as Record<string, unknown>)),
    new Set(["displayName", "quantity", "allergenFlags"]),
  );
  assert.ok(Array.isArray(command.transferHistory));
  assert.equal(command.transferHistory.length, 0);
  assert.ok(!Number.isNaN(Date.parse(command.receivedAt as string)));
  assert.equal(command.createdAt, command.receivedAt);
  assert.equal(command.updatedAt, command.receivedAt);
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
  assert.deepEqual(
    new Set(Object.keys(claim.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
    ]),
  );
  assert.equal(claim.json().data.status, "CLAIMED");
  assert.ok(claim.json().data.ownerActorRef);
  assert.equal(claim.json().data.revision, 2);
  assert.ok(!Number.isNaN(Date.parse(claim.json().data.claimedAt as string)));
  assert.equal(claim.json().data.updatedAt, claim.json().data.claimedAt);

  const release = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/release`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(release.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
    ]),
  );
  assert.equal(release.json().data.status, "RECEIVED");
  assert.equal(release.json().data.revision, 3);

  const reclaim = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/claim`, headers, payload: {} });
  assert.equal(reclaim.json().data.status, "CLAIMED");
  assert.equal(reclaim.json().data.revision, 4);

  const start = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/start`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(start.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
      "startedAt",
    ]),
  );
  assert.equal(start.json().data.status, "IN_PROGRESS");
  assert.equal(start.json().data.revision, 5);
  assert.ok(!Number.isNaN(Date.parse(start.json().data.startedAt as string)));
  assert.equal(start.json().data.updatedAt, start.json().data.startedAt);

  const hold = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/hold`, headers, payload: {} });
  assert.equal(hold.json().data.status, "ON_HOLD");
  assert.equal(hold.json().data.revision, 6);
  const resume = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/resume`, headers, payload: {} });
  assert.equal(resume.json().data.status, "IN_PROGRESS");
  assert.equal(resume.json().data.revision, 7);

  const ready = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/mark-ready`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(ready.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
      "startedAt",
      "readyAt",
    ]),
  );
  assert.equal(ready.json().data.status, "READY");
  assert.equal(ready.json().data.revision, 8);
  assert.ok(!Number.isNaN(Date.parse(ready.json().data.readyAt as string)));
  assert.equal(ready.json().data.updatedAt, ready.json().data.readyAt);
  const done = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/complete-handoff`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(done.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
      "startedAt",
      "readyAt",
      "completedAt",
    ]),
  );
  assert.equal(done.json().data.status, "COMPLETED");
  assert.equal(done.json().data.revision, 9);
  assert.ok(!Number.isNaN(Date.parse(done.json().data.completedAt as string)));
  assert.equal(done.json().data.updatedAt, done.json().data.completedAt);
  await app.close();
});

test("order kitchen commands list and rollback from READY to IN_PROGRESS", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const { orderId, commands } = await submitOrderWithItems(app, headers, branchId);
  const id = commands[0]!.id;

  const byOrder = await app.inject({
    method: "GET",
    url: `/v1/orders/${orderId}/kitchen/commands`,
    headers,
  });
  assert.equal(byOrder.statusCode, 200);
  assert.deepEqual(Object.keys(byOrder.json()).sort(), ["data"]);
  assert.equal(byOrder.json().data.length, 1);
  assert.equal(byOrder.json().data[0].id, id);

  await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/claim`, headers, payload: {} });
  await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/start`, headers, payload: {} });
  await app.inject({ method: "POST", url: `/v1/kitchen/commands/${id}/mark-ready`, headers, payload: {} });

  const rollback = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${id}/rollback`,
    headers,
    payload: { reason: "quality issue" },
  });
  assert.equal(rollback.statusCode, 200);
  assert.deepEqual(Object.keys(rollback.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(rollback.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "cancelReason",
      "payload",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "claimedAt",
      "startedAt",
      "readyAt",
    ]),
  );
  assert.equal(rollback.json().data.status, "IN_PROGRESS");
  assert.equal(rollback.json().data.readyAt, null);
  assert.equal(rollback.json().data.revision, 5);

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
  assert.deepEqual(
    new Set(Object.keys(bad.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(bad.json().type, "https://docs.maitre.app/problems/conflict");
  assert.equal(bad.json().status, 409);

  const missing = await app.inject({ method: "GET", url: `/v1/kitchen/commands/${randomUUID()}`, headers });
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(missing.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missing.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(missing.json().detail, "Command not found");
  assert.equal(missing.json().status, 404);
  await app.close();
});

test("kitchen commands enforce RBAC for cashier and hide unknown command ids as 404", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const owner = ownerHeaders(container, tenantId);
  const { commands } = await submitOrderWithItems(app, owner, branchId);
  const commandId = commands[0]!.id;
  const now = new Date();

  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-kitchen-commands",
    displayName: "Demo Cashier Kitchen Commands",
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
  const cashierToken = "cashier-token-kitchen-commands";
  sessionsOf(container).registerToken(cashierToken, {
    provider: "fixture",
    subject: "demo-cashier-kitchen-commands",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const cashierHeaders = { authorization: `Bearer ${cashierToken}`, "x-tenant-id": tenantId };

  const forbiddenRead = await app.inject({
    method: "GET",
    url: `/v1/kitchen/commands/${commandId}`,
    headers: cashierHeaders,
  });
  assert.equal(forbiddenRead.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenRead.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(forbiddenRead.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(forbiddenRead.json().detail, "Insufficient scope");
  assert.equal(forbiddenRead.json().status, 403);

  const forbiddenClaim = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${commandId}/claim`,
    headers: cashierHeaders,
    payload: {},
  });
  assert.equal(forbiddenClaim.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenClaim.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(forbiddenClaim.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(forbiddenClaim.json().detail, "Insufficient scope");
  assert.equal(forbiddenClaim.json().status, 403);

  const missingClaim = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${randomUUID()}/claim`,
    headers: owner,
    payload: {},
  });
  assert.equal(missingClaim.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(missingClaim.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missingClaim.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(missingClaim.json().detail, "Command not found");
  assert.equal(missingClaim.json().status, 404);

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
  assert.deepEqual(
    new Set(Object.keys(cancel.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "payload",
      "cancelReason",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
      "cancelledAt",
    ]),
  );
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal(cancel.json().data.cancelReason, "86_INGREDIENT");
  assert.equal(cancel.json().data.revision, 2);
  assert.ok(!Number.isNaN(Date.parse(cancel.json().data.cancelledAt as string)));
  assert.equal(cancel.json().data.updatedAt, cancel.json().data.cancelledAt);
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
  assert.deepEqual(
    new Set(Object.keys(transfer.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "payload",
      "cancelReason",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(transfer.json().data.stationId, targetStationId);
  assert.equal(transfer.json().data.transferHistory.length, 1);
  assert.equal(transfer.json().data.revision, 2);
  assert.deepEqual(
    new Set(Object.keys(transfer.json().data.transferHistory[0] as Record<string, unknown>)),
    new Set(["fromStationId", "toStationId", "reason", "actor", "at"]),
  );
  assert.equal(transfer.json().data.transferHistory[0].toStationId, targetStationId);
  assert.equal(transfer.json().data.transferHistory[0].reason, "load balance");
  assert.ok(!Number.isNaN(Date.parse(transfer.json().data.transferHistory[0].at as string)));
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
  assert.deepEqual(
    new Set(Object.keys(bump.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "visitId",
      "orderId",
      "orderItemId",
      "stationId",
      "status",
      "priority",
      "ownerActorRef",
      "payload",
      "cancelReason",
      "transferHistory",
      "revision",
      "receivedAt",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(bump.json().data.priority, 10);
  assert.equal(bump.json().data.revision, 2);

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
  assert.deepEqual(
    new Set(Object.keys(raised.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "commandId",
      "ruleCode",
      "severity",
      "status",
      "openedAt",
      "escalationLevel",
      "resolutionReason",
      "revision",
      "createdAt",
      "updatedAt",
      "brandId",
      "stationId",
    ]),
  );
  assert.equal(raised.json().data[0].status, "OPEN");
  assert.equal(raised.json().data[0].revision, 1);
  assert.equal(raised.json().data[0].escalationLevel, null);
  assert.equal(raised.json().data[0].resolutionReason, null);
  assert.ok(!Number.isNaN(Date.parse(raised.json().data[0].openedAt as string)));
  assert.equal(raised.json().data[0].createdAt, raised.json().data[0].openedAt);
  assert.equal(raised.json().data[0].updatedAt, raised.json().data[0].openedAt);

  const list = await app.inject({ method: "GET", url: `/v1/branches/${branchId}/kitchen/alerts`, headers });
  assert.equal(list.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(list.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "commandId",
      "ruleCode",
      "severity",
      "status",
      "openedAt",
      "escalationLevel",
      "resolutionReason",
      "revision",
      "createdAt",
      "updatedAt",
      "brandId",
      "stationId",
    ]),
  );
  assert.equal(list.json().data[0].id, alertId);

  const ack = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/acknowledge`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(ack.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "commandId",
      "ruleCode",
      "severity",
      "status",
      "openedAt",
      "escalationLevel",
      "resolutionReason",
      "revision",
      "createdAt",
      "updatedAt",
      "brandId",
      "stationId",
      "acknowledgedAt",
    ]),
  );
  assert.equal(ack.json().data.status, "ACKNOWLEDGED");
  assert.equal(ack.json().data.revision, 2);
  assert.equal(ack.json().data.createdAt, raised.json().data[0].createdAt);
  assert.ok(!Number.isNaN(Date.parse(ack.json().data.acknowledgedAt as string)));
  assert.equal(ack.json().data.updatedAt, ack.json().data.acknowledgedAt);

  const esc = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/escalate`, headers, payload: {} });
  assert.deepEqual(
    new Set(Object.keys(esc.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "commandId",
      "ruleCode",
      "severity",
      "status",
      "openedAt",
      "escalationLevel",
      "resolutionReason",
      "revision",
      "createdAt",
      "updatedAt",
      "brandId",
      "stationId",
      "acknowledgedAt",
    ]),
  );
  assert.equal(esc.json().data.status, "ESCALATED");
  assert.equal(esc.json().data.escalationLevel, 1);
  assert.equal(esc.json().data.revision, 3);
  assert.equal(esc.json().data.acknowledgedAt, ack.json().data.acknowledgedAt);

  const resolve = await app.inject({ method: "POST", url: `/v1/kitchen/alerts/${alertId}/resolve`, headers, payload: { reasonCode: "HANDLED" } });
  assert.deepEqual(
    new Set(Object.keys(resolve.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "commandId",
      "ruleCode",
      "severity",
      "status",
      "openedAt",
      "escalationLevel",
      "resolutionReason",
      "revision",
      "createdAt",
      "updatedAt",
      "brandId",
      "stationId",
      "acknowledgedAt",
      "resolvedAt",
    ]),
  );
  assert.equal(resolve.json().data.status, "RESOLVED");
  assert.equal(resolve.json().data.revision, 4);
  assert.equal(resolve.json().data.escalationLevel, 1);
  assert.equal(resolve.json().data.resolutionReason, "HANDLED");
  assert.equal(resolve.json().data.acknowledgedAt, ack.json().data.acknowledgedAt);
  assert.ok(!Number.isNaN(Date.parse(resolve.json().data.resolvedAt as string)));
  assert.equal(resolve.json().data.updatedAt, resolve.json().data.resolvedAt);
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
  assert.deepEqual(
    new Set(Object.keys(res.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(res.json().type, "https://docs.maitre.app/problems/conflict");
  assert.equal(res.json().status, 409);
  await app.close();
});

test("station lifecycle: create, patch, deactivate after queue clears, reactivate", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/kitchen/stations`,
    headers,
    payload: { code: "GARDE", displayName: "Garde Manger", capabilities: ["COLD"], displayOrder: 5 },
  });
  assert.equal(create.statusCode, 201);
  const stationId = create.json().data.id as string;
  assert.deepEqual(
    new Set(Object.keys(create.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "code",
      "displayName",
      "capabilities",
      "status",
      "displayOrder",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(create.json().data.status, "ACTIVE");
  assert.equal(create.json().data.revision, 1);
  assert.ok(!Number.isNaN(Date.parse(create.json().data.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(create.json().data.updatedAt as string)));

  const patch = await app.inject({
    method: "PATCH",
    url: `/v1/kitchen/stations/${stationId}`,
    headers,
    payload: { displayName: "Cold Station", displayOrder: 2 },
  });
  assert.equal(patch.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(patch.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "code",
      "displayName",
      "capabilities",
      "status",
      "displayOrder",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(patch.json().data.displayName, "Cold Station");
  assert.equal(patch.json().data.displayOrder, 2);
  assert.equal(patch.json().data.revision, 2);
  assert.equal(patch.json().data.createdAt, create.json().data.createdAt);

  const deactivate = await app.inject({
    method: "POST",
    url: `/v1/kitchen/stations/${stationId}/deactivate`,
    headers,
    payload: {},
  });
  assert.equal(deactivate.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(deactivate.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "code",
      "displayName",
      "capabilities",
      "status",
      "displayOrder",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(deactivate.json().data.status, "INACTIVE");
  assert.equal(deactivate.json().data.revision, 3);
  assert.equal(deactivate.json().data.createdAt, create.json().data.createdAt);

  const reactivate = await app.inject({
    method: "POST",
    url: `/v1/kitchen/stations/${stationId}/activate`,
    headers,
    payload: {},
  });
  assert.equal(reactivate.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(reactivate.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "branchId",
      "code",
      "displayName",
      "capabilities",
      "status",
      "displayOrder",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(reactivate.json().data.status, "ACTIVE");
  assert.equal(reactivate.json().data.revision, 4);
  assert.equal(reactivate.json().data.createdAt, create.json().data.createdAt);

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
  assert.deepEqual(
    new Set(Object.keys(forbidden.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(forbidden.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(forbidden.json().detail, "Insufficient scope");
  assert.equal(forbidden.json().status, 403);

  const missing = await app.inject({
    method: "GET",
    url: `/v1/kitchen/stations/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(missing.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missing.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(missing.json().detail, "Station not found");
  assert.equal(missing.json().status, 404);
  await app.close();
});
