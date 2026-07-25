import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-087..097 §5 — Fastify inject() coverage for the Ordering domain API.
// Seed ids are the fixed demo ids from the composition container.
const DEMO_TABLE_ID = "00000000-0000-0000-0000-000000000005";
const DEMO_MENU_ID = "00000000-0000-0000-0000-000000000009";
const DEMO_PRODUCT_ID = "00000000-0000-0000-0000-00000000000b";
const DEMO_QR_TOKEN = "demo-qr-menu-token";

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

async function openVisit(app: Awaited<ReturnType<typeof buildApp>>, headers: Record<string, string>, branchId: string) {
  const res = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [DEMO_TABLE_ID], guestCount: 2 },
  });
  assert.equal(res.statusCode, 201);
  return res.json().data.id as string;
}

test("Order lifecycle: create DRAFT, add item, submit dispatches Kitchen Commands", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const create = await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} });
  assert.equal(create.statusCode, 201);
  const order = create.json().data;
  assert.equal(order.status, "DRAFT");

  const addItem = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 2 },
  });
  assert.equal(addItem.statusCode, 201);
  assert.equal(addItem.json().data.subtotalMinorUnits, 700000);

  const submit = await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });
  assert.equal(submit.statusCode, 200);
  assert.equal(submit.json().data.order.status, "SUBMITTED");
  // Submit now creates one Kitchen Command per OrderItem (KitchenTicket retired).
  const commands = submit.json().data.commands;
  assert.equal(commands.length, 1);
  assert.equal(commands[0].status, "RECEIVED");
  await app.close();
});

test("Kitchen Command claim/start/mark-ready/complete-handoff drives Order to DELIVERED", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity: 1 } });
  const command = (await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} })).json().data.commands[0];

  await app.inject({ method: "POST", url: `/v1/kitchen/commands/${command.id}/claim`, headers, payload: {} });
  const start = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${command.id}/start`, headers, payload: {} });
  assert.equal(start.json().data.status, "IN_PROGRESS");

  const ready = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${command.id}/mark-ready`, headers, payload: {} });
  assert.equal(ready.json().data.status, "READY");

  const complete = await app.inject({ method: "POST", url: `/v1/kitchen/commands/${command.id}/complete-handoff`, headers, payload: {} });
  assert.equal(complete.json().data.status, "COMPLETED");

  const orderAfter = (await app.inject({ method: "GET", url: `/v1/orders/${order.id}`, headers })).json().data;
  assert.equal(orderAfter.status, "DELIVERED");
  await app.close();
});

test("Cancel order records an adjustment", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity: 1 } });
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const cancel = await app.inject({ method: "POST", url: `/v1/orders/${order.id}/cancel`, headers, payload: { reasonCode: "GUEST_REQUEST" } });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal(cancel.json().data.adjustments.length, 1);
  await app.close();
});

test("QR menu token: seeded public resolve + issue/resolve + 404 anti-enumeration", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  // Seeded demo token resolves publicly (no auth).
  const seeded = await app.inject({ method: "GET", url: `/public/menu/${DEMO_QR_TOKEN}` });
  assert.equal(seeded.statusCode, 200);
  assert.ok(seeded.json().data.menu);

  // Issue a fresh token and resolve it.
  const issue = await app.inject({ method: "POST", url: "/v1/qr-menu-tokens", headers, payload: { menuId: DEMO_MENU_ID } });
  assert.equal(issue.statusCode, 201);
  const token = issue.json().data.token;
  const resolve = await app.inject({ method: "GET", url: `/public/menu/${token}` });
  assert.equal(resolve.statusCode, 200);

  // Invalid token -> 404 (not 401), indistinguishable from unknown.
  const bad = await app.inject({ method: "GET", url: "/public/menu/not-a-real-token" });
  assert.equal(bad.statusCode, 404);
  await app.close();
});

test("Digital bill token: issue + resolve live Check projection", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const check = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/check`, headers, payload: { currency: "ARS" } })).json().data;
  const issue = await app.inject({ method: "POST", url: "/v1/bill-tokens", headers, payload: { checkId: check.id } });
  assert.equal(issue.statusCode, 201);
  const token = issue.json().data.token;

  const bill = await app.inject({ method: "GET", url: `/public/bills/${token}` });
  assert.equal(bill.statusCode, 200);
  assert.equal(bill.json().data.status, "OPEN");
  assert.ok("checkRevision" in bill.json().data);

  const bad = await app.inject({ method: "GET", url: "/public/bills/garbage" });
  assert.equal(bad.statusCode, 404);
  await app.close();
});

test("Order tracking token: issue + public resolve (redacted)", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity: 1 } });
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const issue = await app.inject({ method: "POST", url: `/v1/orders/${order.id}/tracking-token`, headers, payload: {} });
  assert.equal(issue.statusCode, 201);
  const track = await app.inject({ method: "GET", url: `/public/tracking/${issue.json().data.token}` });
  assert.equal(track.statusCode, 200);
  assert.equal(track.json().data.status, "SUBMITTED");
  // Redacted: no product names in the public view.
  assert.equal(track.json().data.items[0].name, undefined);
  await app.close();
});

test("Menu recommendations fallback returns policyVersion fallback-v1", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const res = await app.inject({ method: "GET", url: `/v1/menus/${DEMO_MENU_ID}/recommendations`, headers });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().data.policyVersion, "fallback-v1");
  assert.ok(res.json().data.items.length > 0);
  await app.close();
});

test("Special request: create, accept, fulfill", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const create = await app.inject({
    method: "POST",
    url: "/v1/special-requests",
    headers,
    payload: { requestType: "BIRTHDAY", targetType: "VISIT", targetId: randomUUID() },
  });
  assert.equal(create.statusCode, 201);
  const id = create.json().data.id;

  const accept = await app.inject({ method: "POST", url: `/v1/special-requests/${id}/accept`, headers, payload: {} });
  assert.equal(accept.json().data.status, "ACCEPTED");
  const fulfill = await app.inject({ method: "POST", url: `/v1/special-requests/${id}/fulfill`, headers, payload: {} });
  assert.equal(fulfill.json().data.status, "FULFILLED");
  await app.close();
});

test("403 without permission, 404 for unknown order id", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-ordering",
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
  const token = "cashier-token-ordering";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cashier-ordering",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  // CASHIER has order:read but not order:create.
  const forbidden = await app.inject({
    method: "POST",
    url: `/v1/visits/${randomUUID()}/orders`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {},
  });
  assert.equal(forbidden.statusCode, 403);

  const missing = await app.inject({
    method: "GET",
    url: `/v1/orders/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(missing.statusCode, 404);
  void branchId;
  await app.close();
});
