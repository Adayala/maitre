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

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

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

serialTest("Order lifecycle: create DRAFT, add item, submit dispatches Kitchen Commands", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const create = await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} });
  assert.equal(create.statusCode, 201);
  const order = create.json().data;
  assert.deepEqual(
    new Set(Object.keys(order as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(order.status, "DRAFT");
  assert.equal(order.revision, 1);
  assert.deepEqual(order.items, []);
  assert.deepEqual(order.adjustments, []);
  assert.ok(!Number.isNaN(Date.parse(order.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(order.updatedAt as string)));

  const addItem = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 2 },
  });
  assert.equal(addItem.statusCode, 201);
  assert.deepEqual(
    new Set(Object.keys(addItem.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(addItem.json().data.revision, 2);
  assert.equal(addItem.json().data.items.length, 1);
  assert.deepEqual(
    new Set(Object.keys(addItem.json().data.items[0] as Record<string, unknown>)),
    new Set(["id", "productId", "name", "quantity", "unitPriceMinorUnits", "currency", "modifiers", "allergens", "status"]),
  );
  assert.equal(addItem.json().data.subtotalMinorUnits, 700000);

  const submit = await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });
  assert.equal(submit.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(submit.json().data as Record<string, unknown>)),
    new Set(["order", "commands"]),
  );
  assert.deepEqual(
    new Set(Object.keys(submit.json().data.order as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
    ]),
  );
  assert.equal(submit.json().data.order.status, "SUBMITTED");
  assert.equal(submit.json().data.order.revision, 3);
  assert.ok(!Number.isNaN(Date.parse(submit.json().data.order.submittedAt as string)));
  assert.equal(submit.json().data.order.updatedAt, submit.json().data.order.submittedAt);
  // Submit now creates one Kitchen Command per OrderItem (KitchenTicket retired).
  const commands = submit.json().data.commands;
  assert.equal(commands.length, 1);
  assert.equal(commands[0].status, "RECEIVED");
  await app.close();
});

serialTest("Kitchen Command claim/start/mark-ready/complete-handoff drives Order to DELIVERED", async () => {
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

serialTest("Cancel order records an adjustment", async () => {
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
  assert.deepEqual(
    new Set(Object.keys(cancel.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
      "cancelledAt",
    ]),
  );
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal(cancel.json().data.adjustments.length, 1);
  assert.equal(cancel.json().data.revision, 4);
  assert.ok(!Number.isNaN(Date.parse(cancel.json().data.cancelledAt as string)));
  assert.equal(cancel.json().data.updatedAt, cancel.json().data.cancelledAt);
  await app.close();
});

serialTest("Change quantity applies synchronously and records an adjustment", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  const withItem = (
    await app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/items`,
      headers,
      payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
    })
  ).json().data;
  const itemId = withItem.items[0].id as string;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const changed = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/change-quantity`,
    headers,
    payload: { newQuantity: 3, reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(changed.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(changed.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
    ]),
  );
  assert.equal(changed.json().data.items[0].quantity, 3);
  assert.deepEqual(
    new Set(Object.keys(changed.json().data.items[0] as Record<string, unknown>)),
    new Set(["id", "productId", "name", "quantity", "unitPriceMinorUnits", "currency", "modifiers", "allergens", "status"]),
  );
  assert.equal(changed.json().data.adjustments.length, 1);
  assert.deepEqual(
    new Set(Object.keys(changed.json().data.adjustments[0] as Record<string, unknown>)),
    new Set(["id", "reasonCode", "actorType", "deltaAmountMinorUnits", "orderItemId", "createdAt"]),
  );
  assert.equal(changed.json().data.adjustments[0].reasonCode, "GUEST_REQUEST");
  assert.equal(changed.json().data.adjustments[0].orderItemId, itemId);
  assert.ok(!Number.isNaN(Date.parse(changed.json().data.adjustments[0].createdAt as string)));
  assert.equal(changed.json().data.revision, 4);
  assert.equal(changed.json().data.subtotalMinorUnits, 1050000);
  await app.close();
});

serialTest("Order item cancel and transition endpoints enforce lifecycle and permission contracts", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const owner = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, owner, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers: owner, payload: {} })).json().data;
  const withItem = (
    await app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/items`,
      headers: owner,
      payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
    })
  ).json().data;
  const itemId = withItem.items[0].id as string;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers: owner, payload: {} });

  const invalidDelivered = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/transition`,
    headers: owner,
    payload: { to: "DELIVERED" },
  });
  assert.equal(invalidDelivered.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(invalidDelivered.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(invalidDelivered.json().type, "conflict");
  assert.equal(invalidDelivered.json().status, 409);

  const now = new Date();
  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-order-item-contract",
    displayName: "Demo Cashier Order Item Contract",
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
  const cashierToken = "cashier-token-order-item-contract";
  sessionsOf(container).registerToken(cashierToken, {
    provider: "fixture",
    subject: "demo-cashier-order-item-contract",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  const cashierHeaders = { authorization: `Bearer ${cashierToken}`, "x-tenant-id": tenantId };

  const forbiddenPrep = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/transition`,
    headers: cashierHeaders,
    payload: { to: "IN_PREP" },
  });
  assert.equal(forbiddenPrep.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenPrep.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forbiddenPrep.json().type, "insufficient-scope");
  assert.equal(forbiddenPrep.json().title, "Insufficient scope");
  assert.equal(forbiddenPrep.json().status, 403);

  const inPrep = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/transition`,
    headers: owner,
    payload: { to: "IN_PREP" },
  });
  assert.equal(inPrep.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(inPrep.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
    ]),
  );
  assert.equal(inPrep.json().data.items[0].status, "IN_PREP");
  assert.equal(inPrep.json().data.status, "IN_PREP");
  assert.equal(inPrep.json().data.revision, 4);

  const forbiddenPreparedCancel = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/cancel`,
    headers: cashierHeaders,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(forbiddenPreparedCancel.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenPreparedCancel.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forbiddenPreparedCancel.json().type, "insufficient-scope");
  assert.equal(forbiddenPreparedCancel.json().title, "Insufficient scope");
  assert.equal(forbiddenPreparedCancel.json().status, 403);

  const ready = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/transition`,
    headers: owner,
    payload: { to: "READY" },
  });
  assert.equal(ready.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(ready.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
    ]),
  );
  assert.equal(ready.json().data.items[0].status, "READY");
  assert.equal(ready.json().data.status, "READY");
  assert.equal(ready.json().data.revision, 5);

  const cancelPrepared = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/cancel`,
    headers: owner,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancelPrepared.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(cancelPrepared.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
      "cancelledAt",
    ]),
  );
  assert.deepEqual(
    new Set(Object.keys(cancelPrepared.json().data.items[0] as Record<string, unknown>)),
    new Set([
      "id",
      "productId",
      "name",
      "quantity",
      "unitPriceMinorUnits",
      "currency",
      "modifiers",
      "allergens",
      "status",
      "cancelReason",
      "cancelledAt",
    ]),
  );
  assert.equal(cancelPrepared.json().data.items[0].status, "CANCELLED");
  assert.equal(cancelPrepared.json().data.items[0].cancelReason, "GUEST_REQUEST");
  assert.ok(!Number.isNaN(Date.parse(cancelPrepared.json().data.items[0].cancelledAt as string)));
  assert.equal(cancelPrepared.json().data.adjustments.length, 1);
  assert.deepEqual(
    new Set(Object.keys(cancelPrepared.json().data.adjustments[0] as Record<string, unknown>)),
    new Set(["id", "reasonCode", "actorType", "deltaAmountMinorUnits", "orderItemId", "createdAt"]),
  );
  assert.equal(cancelPrepared.json().data.adjustments[0].orderItemId, itemId);
  assert.equal(cancelPrepared.json().data.status, "CANCELLED");
  assert.equal(cancelPrepared.json().data.revision, 6);
  assert.ok(!Number.isNaN(Date.parse(cancelPrepared.json().data.cancelledAt as string)));
  assert.equal(cancelPrepared.json().data.updatedAt, cancelPrepared.json().data.cancelledAt);

  const cancelAgain = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/cancel`,
    headers: owner,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancelAgain.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(cancelAgain.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(cancelAgain.json().type, "conflict");
  assert.equal(cancelAgain.json().status, 409);

  await app.close();
});

serialTest("Order item cancel and transition hide unknown and cross-tenant targets as 404", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  const withItem = (
    await app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/items`,
      headers,
      payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
    })
  ).json().data;
  const itemId = withItem.items[0].id as string;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const unknownTransition = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${randomUUID()}/transition`,
    headers,
    payload: { to: "IN_PREP" },
  });
  assert.equal(unknownTransition.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownTransition.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownTransition.json().type, "not-found");
  assert.equal(unknownTransition.json().title, "OrderItem not found");
  assert.equal(unknownTransition.json().status, 404);

  const unknownCancel = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${randomUUID()}/cancel`,
    headers,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(unknownCancel.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownCancel.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownCancel.json().type, "not-found");
  assert.equal(unknownCancel.json().title, "OrderItem not found");
  assert.equal(unknownCancel.json().status, 404);

  const otherTenantId = randomUUID();
  const now = new Date();
  await container.tenants.save({
    id: otherTenantId,
    name: "Other Tenant Ordering Items",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  await container.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: owner!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const crossTenantTransition = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/transition`,
    headers: { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": otherTenantId },
    payload: { to: "IN_PREP" },
  });
  assert.equal(crossTenantTransition.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(crossTenantTransition.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(crossTenantTransition.json().type, "not-found");
  assert.equal(crossTenantTransition.json().title, "OrderItem not found");
  assert.equal(crossTenantTransition.json().status, 404);

  const crossTenantCancel = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${itemId}/cancel`,
    headers: { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": otherTenantId },
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(crossTenantCancel.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(crossTenantCancel.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(crossTenantCancel.json().type, "not-found");
  assert.equal(crossTenantCancel.json().title, "Order not found");
  assert.equal(crossTenantCancel.json().status, 404);

  await app.close();
});

serialTest("Order submit is idempotent and does not redispatch commands on re-submit", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
  });

  const first = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/submit`,
    headers,
    payload: { catalogRevisionId: "catalog-rev-1" },
  });
  assert.equal(first.statusCode, 200);
  assert.deepEqual(Object.keys(first.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(first.json().data as Record<string, unknown>)),
    new Set(["order", "commands"]),
  );
  assert.deepEqual(
    new Set(Object.keys(first.json().data.order as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
      "catalogRevisionId",
    ]),
  );
  assert.equal(first.json().data.order.status, "SUBMITTED");
  assert.equal(first.json().data.order.catalogRevisionId, "catalog-rev-1");
  assert.equal(first.json().data.commands.length, 1);
  const firstRevision = first.json().data.order.revision as number;
  const firstSubmittedAt = first.json().data.order.submittedAt as string;

  const second = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/submit`,
    headers,
    payload: { catalogRevisionId: "catalog-rev-2" },
  });
  assert.equal(second.statusCode, 200);
  assert.deepEqual(Object.keys(second.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(second.json().data as Record<string, unknown>)),
    new Set(["order", "commands"]),
  );
  assert.deepEqual(
    new Set(Object.keys(second.json().data.order as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "items",
      "adjustments",
      "status",
      "subtotalMinorUnits",
      "taxTotalMinorUnits",
      "grandTotalMinorUnits",
      "revision",
      "createdAt",
      "updatedAt",
      "submittedAt",
      "catalogRevisionId",
    ]),
  );
  assert.equal(second.json().data.order.status, "SUBMITTED");
  assert.equal(second.json().data.order.catalogRevisionId, "catalog-rev-1");
  assert.equal(second.json().data.order.revision, firstRevision);
  assert.equal(second.json().data.order.submittedAt, firstSubmittedAt);
  assert.equal(second.json().data.commands.length, 0);

  const kitchenCommands = await app.inject({
    method: "GET",
    url: `/v1/orders/${order.id}/kitchen/commands`,
    headers,
  });
  assert.equal(kitchenCommands.statusCode, 200);
  assert.deepEqual(Object.keys(kitchenCommands.json()).sort(), ["data"]);
  assert.equal(kitchenCommands.json().data.length, 1);

  await app.close();
});

serialTest("Order submit rejects an empty draft with 409 conflict", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;

  const submit = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/submit`,
    headers,
    payload: {},
  });
  assert.equal(submit.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(submit.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(submit.json().type, "conflict");
  assert.equal(submit.json().status, 409);

  const orderAfter = await app.inject({
    method: "GET",
    url: `/v1/orders/${order.id}`,
    headers,
  });
  assert.equal(orderAfter.statusCode, 200);
  assert.deepEqual(Object.keys(orderAfter.json()).sort(), ["data"]);
  assert.equal(orderAfter.json().data.status, "DRAFT");
  assert.equal(orderAfter.json().data.items.length, 0);

  await app.close();
});

serialTest("Order kitchen commands list requires kitchen queue permission and returns empty for unknown or cross-tenant orders", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
  });
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const now = new Date();
  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-order-command-list",
    displayName: "Demo Cashier Order Command List",
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
  const cashierToken = "cashier-token-order-command-list";
  sessionsOf(container).registerToken(cashierToken, {
    provider: "fixture",
    subject: "demo-cashier-order-command-list",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "GET",
    url: `/v1/orders/${order.id}/kitchen/commands`,
    headers: { authorization: `Bearer ${cashierToken}`, "x-tenant-id": tenantId },
  });
  assert.equal(forbidden.statusCode, 403);

  const unknownOrder = await app.inject({
    method: "GET",
    url: `/v1/orders/${randomUUID()}/kitchen/commands`,
    headers,
  });
  assert.equal(unknownOrder.statusCode, 200);
  assert.deepEqual(unknownOrder.json().data, []);

  const otherTenantId = randomUUID();
  await container.tenants.save({
    id: otherTenantId,
    name: "Other Tenant Order Commands",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  await container.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: owner!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const crossTenant = await app.inject({
    method: "GET",
    url: `/v1/orders/${order.id}/kitchen/commands`,
    headers: { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": otherTenantId },
  });
  assert.equal(crossTenant.statusCode, 200);
  assert.deepEqual(crossTenant.json().data, []);

  await app.close();
});

serialTest("Order item routes expose current 404 contract for unknown order vs unknown item", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  const withItem = (
    await app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/items`,
      headers,
      payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
    })
  ).json().data;
  const itemId = withItem.items[0].id as string;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const missingOrderCancel = await app.inject({
    method: "POST",
    url: `/v1/orders/${randomUUID()}/items/${itemId}/cancel`,
    headers,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(missingOrderCancel.statusCode, 404);

  const missingOrderTransition = await app.inject({
    method: "POST",
    url: `/v1/orders/${randomUUID()}/items/${itemId}/transition`,
    headers,
    payload: { to: "IN_PREP" },
  });
  assert.equal(missingOrderTransition.statusCode, 404);

  const missingItemCancel = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${randomUUID()}/cancel`,
    headers,
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(missingItemCancel.statusCode, 404);

  const missingItemTransition = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items/${randomUUID()}/transition`,
    headers,
    payload: { to: "IN_PREP" },
  });
  assert.equal(missingItemTransition.statusCode, 404);

  await app.close();
});

serialTest("QR menu token: seeded public resolve + issue/resolve + 404 anti-enumeration", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  // Seeded demo token resolves publicly (no auth).
  const seeded = await app.inject({ method: "GET", url: `/public/menu/${DEMO_QR_TOKEN}` });
  assert.equal(seeded.statusCode, 200);
  assert.ok(seeded.json().data.menu);
  assert.equal(typeof seeded.headers.etag, "string");
  assert.equal(seeded.json().data.menu.id, undefined);

  // Issue a fresh token and resolve it.
  const issue = await app.inject({
    method: "POST",
    url: "/v1/qr-menu-tokens",
    headers,
    payload: { menuId: DEMO_MENU_ID, branchId },
  });
  assert.equal(issue.statusCode, 201);
  const token = issue.json().data.token;
  const resolve = await app.inject({ method: "GET", url: `/public/menu/${token}` });
  assert.equal(resolve.statusCode, 200);
  assert.equal(resolve.json().data.categories[0].id, undefined);
  assert.equal(resolve.json().data.categories[0].products[0].id, undefined);
  assert.equal(typeof resolve.json().data.menu.asOf, "string");

  // Invalid token -> 404 (not 401), indistinguishable from unknown.
  const bad = await app.inject({ method: "GET", url: "/public/menu/not-a-real-token" });
  assert.equal(bad.statusCode, 404);
  await app.close();
});

serialTest("Digital bill token: issue + resolve live Check projection", async () => {
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
  assert.equal(bill.json().data.freshness.mode, "LIVE_SNAPSHOT");
  assert.equal(bill.json().data.freshness.consistency, "EVENTUAL");
  assert.equal(typeof bill.json().data.lastConfirmedAt, "string");
  assert.equal(Array.isArray(bill.json().data.adjustments), true);
  assert.equal(typeof bill.json().data.paymentsSummary.balanceMinorUnits, "number");

  const bad = await app.inject({ method: "GET", url: "/public/bills/garbage" });
  assert.equal(bad.statusCode, 404);
  await app.close();
});

serialTest("Digital bill token issue respects branch scope", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const owner = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, owner, branchId);
  const check = (
    await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/check`,
      headers: owner,
      payload: { currency: "ARS" },
    })
  ).json().data;

  const now = new Date();
  const scopedUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-scoped-bill-reader",
    displayName: "Scoped Bill Reader",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_cashier"],
    branchIds: [randomUUID()],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "scoped-bill-reader-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-scoped-bill-reader",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbiddenIssue = await app.inject({
    method: "POST",
    url: "/v1/bill-tokens",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { checkId: check.id },
  });
  assert.equal(forbiddenIssue.statusCode, 404);
  await app.close();
});

serialTest("Capability token issue endpoints reject invalid ttlSeconds", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const check = (await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/check`,
    headers,
    payload: { currency: "ARS" },
  })).json().data;

  const billToken = await app.inject({
    method: "POST",
    url: "/v1/bill-tokens",
    headers,
    payload: { checkId: check.id, ttlSeconds: 0 },
  });
  assert.equal(billToken.statusCode, 400);

  const qrToken = await app.inject({
    method: "POST",
    url: "/v1/qr-menu-tokens",
    headers,
    payload: { menuId: DEMO_MENU_ID, ttlSeconds: 0 },
  });
  assert.equal(qrToken.statusCode, 400);

  const order = (await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/orders`,
    headers,
    payload: {},
  })).json().data;
  await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
  });
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const trackingToken = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/tracking-token`,
    headers,
    payload: { ttlSeconds: 0 },
  });
  assert.equal(trackingToken.statusCode, 400);

  await app.close();
});

serialTest("Order tracking token: issue + public resolve (redacted)", async () => {
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
  assert.equal(typeof track.json().data.projectionCursor, "string");
  assert.equal(track.json().data.freshness.consistency, "EVENTUAL");
  assert.equal(typeof track.json().data.items[0].confirmedAt, "string");
  // Redacted: no product names in the public view.
  assert.equal(track.json().data.items[0].name, undefined);
  await app.close();
});

serialTest("Order tracking internal detail includes projection metadata and item names", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, headers, branchId);

  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers, payload: {} })).json().data;
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/items`, headers, payload: { productId: DEMO_PRODUCT_ID, quantity: 1 } });
  await app.inject({ method: "POST", url: `/v1/orders/${order.id}/submit`, headers, payload: {} });

  const tracking = await app.inject({ method: "GET", url: `/v1/orders/${order.id}/tracking`, headers });
  assert.equal(tracking.statusCode, 200);
  assert.equal(tracking.json().data.orderId, order.id);
  assert.equal(typeof tracking.json().data.projectionCursor, "string");
  assert.equal(tracking.json().data.freshness.mode, "LIVE_SNAPSHOT");
  assert.equal(tracking.json().data.items[0].name, "Empanadas de Carne");
  assert.equal(typeof tracking.json().data.items[0].confirmedAt, "string");
  await app.close();
});

serialTest("Order tracking internal access and token issue respect branch scope", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const owner = ownerHeaders(container, tenantId);
  const visitId = await openVisit(app, owner, branchId);
  const order = (await app.inject({ method: "POST", url: `/v1/visits/${visitId}/orders`, headers: owner, payload: {} })).json().data;

  const now = new Date();
  const scopedUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-scoped-order-reader",
    displayName: "Scoped Order Reader",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_cashier"],
    branchIds: [randomUUID()],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "scoped-order-reader-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-scoped-order-reader",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbiddenInternal = await app.inject({
    method: "GET",
    url: `/v1/orders/${order.id}/tracking`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(forbiddenInternal.statusCode, 404);

  const forbiddenIssue = await app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/tracking-token`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {},
  });
  assert.equal(forbiddenIssue.statusCode, 404);
  await app.close();
});

serialTest("Menu recommendations fallback returns policyVersion fallback-v1", async () => {
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

serialTest("Special request: create, accept, fulfill", async () => {
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

serialTest("Special request: freeText is normalized and overlong text is rejected", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const normalized = await app.inject({
    method: "POST",
    url: "/v1/special-requests",
    headers,
    payload: {
      requestType: "BIRTHDAY",
      targetType: "VISIT",
      targetId: randomUUID(),
      freeText: "  Bring   a   candle  ",
    },
  });
  assert.equal(normalized.statusCode, 201);
  assert.equal(normalized.json().data.freeText, "Bring a candle");

  const tooLong = await app.inject({
    method: "POST",
    url: "/v1/special-requests",
    headers,
    payload: {
      requestType: "ALLERGY_NOTE",
      targetType: "ORDER",
      targetId: randomUUID(),
      freeText: "x".repeat(501),
    },
  });
  assert.equal(tooLong.statusCode, 400);

  await app.close();
});

serialTest("Special request: invalid transition and tenant isolation return conflict/not-found", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const created = await app.inject({
    method: "POST",
    url: "/v1/special-requests",
    headers,
    payload: { requestType: "ALLERGY_NOTE", targetType: "ORDER", targetId: randomUUID() },
  });
  assert.equal(created.statusCode, 201);
  const id = created.json().data.id as string;

  const fulfillBeforeAccept = await app.inject({
    method: "POST",
    url: `/v1/special-requests/${id}/fulfill`,
    headers,
    payload: {},
  });
  assert.equal(fulfillBeforeAccept.statusCode, 409);

  const otherTenantId = randomUUID();
  await container.tenants.save({
    id: otherTenantId,
    name: "Other Tenant Ordering",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const now = new Date();
  await container.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: owner!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const crossTenant = await app.inject({
    method: "GET",
    url: `/v1/special-requests/${id}`,
    headers: { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": otherTenantId },
  });
  assert.equal(crossTenant.statusCode, 404);

  await app.close();
});

serialTest("Special request: review endpoints require special_request:review permission", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();

  const created = await app.inject({
    method: "POST",
    url: "/v1/special-requests",
    headers,
    payload: { requestType: "BIRTHDAY", targetType: "VISIT", targetId: randomUUID() },
  });
  assert.equal(created.statusCode, 201);
  const id = created.json().data.id as string;

  const cashier = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cashier-special-request",
    displayName: "Demo Cashier Special Request",
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
  const cashierToken = "cashier-token-special-request";
  sessionsOf(container).registerToken(cashierToken, {
    provider: "fixture",
    subject: "demo-cashier-special-request",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: `/v1/special-requests/${id}/accept`,
    headers: { authorization: `Bearer ${cashierToken}`, "x-tenant-id": tenantId },
    payload: {},
  });
  assert.equal(forbidden.statusCode, 403);

  await app.close();
});

serialTest("403 without permission, 404 for unknown order id", async () => {
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
