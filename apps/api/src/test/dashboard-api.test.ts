import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";

// SPEC-224 §5 — Fastify inject() covers SPEC-046 (Setup Status) and
// SPEC-047 (Overview).

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  return memberships[0]!.tenantId;
}

test("GET /v1/dashboard/setup-status reports COMPLETE for every seeded item", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/dashboard/setup-status",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set(["setup", "nextSteps"]),
  );
  const setup = response.json().data.setup;
  assert.deepEqual(
    new Set(Object.keys(setup as Record<string, unknown>)),
    new Set(["tenant", "brands", "branches", "users", "menus", "products"]),
  );
  assert.equal(setup.tenant.status, "COMPLETE");
  assert.equal(setup.brands.status, "COMPLETE");
  assert.equal(setup.branches.status, "COMPLETE");
  assert.equal(setup.users.status, "COMPLETE");
  assert.equal(setup.menus.status, "COMPLETE");
  assert.equal(setup.products.status, "COMPLETE");
  assert.equal(setup.tenant.count, 1);
  assert.equal(setup.tenant.required, 1);
  assert.equal(setup.brands.actionLink, "/v1/brands");
  assert.equal(setup.branches.actionLink, "/v1/branches");
  assert.equal(setup.users.actionLink, "/v1/users");
  assert.deepEqual(response.json().data.nextSteps, []);
  await app.close();
});

test("GET /v1/dashboard/setup-status for a freshly created (empty) tenant is INCOMPLETE", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);

  const created = await app.inject({
    method: "POST",
    url: "/v1/tenants",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
    payload: { name: "Empty Tenant" },
  });
  const newTenantId = created.json().data.id;

  const response = await app.inject({
    method: "GET",
    url: "/v1/dashboard/setup-status",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": newTenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  const setup = response.json().data.setup;
  assert.equal(setup.tenant.status, "COMPLETE");
  assert.equal(setup.brands.status, "INCOMPLETE");
  assert.equal(setup.brands.count, 0);
  assert.equal(setup.brands.required, 1);
  assert.equal(setup.branches.status, "INCOMPLETE");
  assert.equal(setup.users.status, "COMPLETE");
  assert.equal(setup.users.count, 1);
  assert.equal(setup.menus.status, "INCOMPLETE");
  assert.equal(setup.products.status, "INCOMPLETE");
  assert.ok(response.json().data.nextSteps.includes("Configurar brands"));
  assert.ok(response.json().data.nextSteps.length > 0);
  await app.close();
});

test("GET /v1/dashboard/setup-status requires tenant context (403 without X-Tenant-Id)", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/dashboard/setup-status",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });
  assert.equal(response.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/insufficient-scope",
  );
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
  await app.close();
});

test("GET /v1/dashboard/overview derives available operational metrics", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const now = new Date("2026-07-30T12:00:00.000Z");
  await container.visits.save({
    id: "overview-visit",
    tenantId,
    branchId: branch.id,
    tableIds: ["overview-table"],
    guestCount: 2,
    status: "OPEN",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });
  await container.occupancies.save({
    id: "overview-occupancy",
    tenantId,
    branchId: branch.id,
    tableId: "overview-table",
    visitId: "overview-visit",
    guestCount: 2,
    status: "ACTIVE",
    startedAt: now,
    revision: 1,
  });
  await container.orders.save({
    id: "overview-order",
    tenantId,
    branchId: branch.id,
    visitId: "overview-visit",
    currency: "ARS",
    items: [],
    adjustments: [],
    status: "DRAFT",
    subtotalMinorUnits: 0,
    taxTotalMinorUnits: 0,
    grandTotalMinorUnits: 0,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });
  await container.checks.save({
    id: "overview-check",
    tenantId,
    branchId: branch.id,
    visitId: "overview-visit",
    currency: "ARS",
    lines: [],
    adjustments: [],
    status: "PAYMENT_PENDING",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });
  await container.payments.save({
    id: "overview-payment",
    tenantId,
    branchId: branch.id,
    checkId: "overview-check",
    amountMinorUnits: 1_000,
    currency: "ARS",
    method: "CARD",
    status: "PENDING",
    idempotencyKey: "overview-payment-key",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/dashboard/overview",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  const body = response.json().data;
  assert.deepEqual(
    new Set(Object.keys(body as Record<string, unknown>)),
    new Set(["setup", "operations", "lastUpdated"]),
  );
  assert.deepEqual(
    new Set(Object.keys(body.setup as Record<string, unknown>)),
    new Set(["status", "asOf", "tenantName", "brandCount", "branchCount"]),
  );
  assert.equal(body.setup.status, "AVAILABLE");
  assert.equal(typeof body.setup.asOf, "string");
  assert.equal(body.setup.tenantName, "Maitre Demo Tenant");
  assert.equal(body.setup.brandCount, 1);
  assert.equal(body.setup.branchCount, 1);
  assert.deepEqual(
    new Set(Object.keys(body.operations as Record<string, unknown>)),
    new Set([
      "status",
      "asOf",
      "openVisits",
      "occupiedTables",
      "activeOrders",
      "pendingPayments",
    ]),
  );
  assert.equal(body.operations.status, "AVAILABLE");
  assert.equal(typeof body.operations.asOf, "string");
  assert.equal(body.operations.openVisits, 1);
  assert.equal(body.operations.occupiedTables, 1);
  assert.equal(body.operations.activeOrders, 1);
  assert.equal(body.operations.pendingPayments, 1);
  assert.equal(typeof body.lastUpdated, "string");
  await app.close();
});

test("GET /v1/dashboard/overview degrades operations without fabricating zeroes", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  container.visits.listByBranch = async () => {
    throw new Error("operations-source-unavailable");
  };
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/dashboard/overview",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json().data;
  assert.equal(body.setup.status, "AVAILABLE");
  assert.equal(body.operations.status, "UNAVAILABLE");
  assert.equal(body.operations.reason, "Operational sources unavailable");
  assert.equal(body.operations.openVisits, null);
  assert.equal(body.operations.occupiedTables, null);
  assert.equal(body.operations.activeOrders, null);
  assert.equal(body.operations.pendingPayments, null);
  await app.close();
});
