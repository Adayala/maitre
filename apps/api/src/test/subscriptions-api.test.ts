import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  InMemoryOutboxRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";

// SPEC-224 §5 — Fastify inject() covers SPEC-031 (Subscriptions) and
// SPEC-032 (Entitlements).

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  return memberships[0]!.tenantId;
}

async function seedForeignSubscription(container: Container) {
  const now = new Date();
  const tenantId = randomUUID();
  const subscriptionId = randomUUID();
  await container.tenants.save({
    id: tenantId,
    name: "Foreign Tenant",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  await container.subscriptions.save({
    id: subscriptionId,
    tenantId,
    planCode: "PROFESSIONAL",
    status: "ACTIVE",
    billingCycle: "MONTHLY",
    startDate: now,
    renewalDate: now,
    cancellationDate: null,
    currentPeriodStart: now,
    currentPeriodEnd: now,
    autoRenew: true,
    createdAt: now,
    updatedAt: now,
  });
  return { tenantId, subscriptionId };
}

test("GET /v1/subscriptions/:tenantId returns the seeded subscription", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: `/v1/subscriptions/${tenantId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "planCode",
      "status",
      "billingCycle",
      "startDate",
      "renewalDate",
      "currentPeriodStart",
      "currentPeriodEnd",
      "autoRenew",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data.planCode, "PROFESSIONAL");
  assert.equal(response.json().data.status, "TRIAL");
  await app.close();
});

test("GET /v1/subscriptions/:tenantId for a different tenant returns 404", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/subscriptions/00000000-0000-0000-0000-000000000099",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "not-found");
  assert.equal(response.json().title, "Subscription not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("GET /v1/entitlements/:tenantId lists entitlements and quotas", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: `/v1/entitlements/${tenantId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set(["entitlements", "quotas"]),
  );
  assert.ok(Array.isArray(response.json().data.entitlements));
  assert.ok(Array.isArray(response.json().data.quotas));
  assert.deepEqual(
    new Set(Object.keys(response.json().data.entitlements[0] as Record<string, unknown>)),
    new Set(["resource", "hardLimit", "softLimit"]),
  );
  const branches = response
    .json()
    .data.entitlements.find((e: { resource: string }) => e.resource === "branches");
  assert.equal(branches.hardLimit, 5); // PROFESSIONAL default
  await app.close();
});

test("POST /v1/subscriptions/:id/services activates a service and raises entitlements", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const subscription = await container.subscriptions.findByTenantId(tenantId);

  const response = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor" },
  });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set(["id", "subscriptionId", "serviceId", "status", "quantity", "unitPrice", "activatedAt"]),
  );
  assert.equal(response.json().data.status, "ACTIVE");
  assert.equal(response.json().data.quantity, 1);
  assert.equal(response.json().data.unitPrice, 0);
  assert.ok(!Number.isNaN(Date.parse(response.json().data.activatedAt as string)));

  const entResponse = await app.inject({
    method: "GET",
    url: `/v1/entitlements/${tenantId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  const branches = entResponse
    .json()
    .data.entitlements.find((e: { resource: string }) => e.resource === "branches");
  assert.equal(branches.hardLimit, 10);
  await app.close();
});

test("POST /v1/subscriptions/:id/services appends ServiceActivated to the outbox", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const subscription = await container.subscriptions.findByTenantId(tenantId);
  const before = outboxOf(container).all().length;

  await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor" },
  });

  const records = outboxOf(container).all();
  assert.equal(records.length, before + 1);
  assert.equal(records[records.length - 1]!.eventName, "ServiceActivated");
  await app.close();
});

test("DELETE /v1/subscriptions/:id/services/:serviceId deactivates and lowers entitlements back", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const subscription = await container.subscriptions.findByTenantId(tenantId);

  await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor" },
  });

  const del = await app.inject({
    method: "DELETE",
    url: `/v1/subscriptions/${subscription!.id}/services/floor`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(del.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(del.json().data as Record<string, unknown>)),
    new Set(["id", "subscriptionId", "serviceId", "status", "quantity", "unitPrice", "activatedAt", "deactivatedAt"]),
  );
  assert.equal(del.json().data.status, "INACTIVE");
  assert.equal(del.json().data.quantity, 1);
  assert.equal(del.json().data.unitPrice, 0);
  assert.ok(!Number.isNaN(Date.parse(del.json().data.activatedAt as string)));
  assert.ok(!Number.isNaN(Date.parse(del.json().data.deactivatedAt as string)));
  await app.close();
});

test("DELETE .../services/:serviceId for an unknown service returns 404", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const subscription = await container.subscriptions.findByTenantId(tenantId);

  const response = await app.inject({
    method: "DELETE",
    url: `/v1/subscriptions/${subscription!.id}/services/does-not-exist`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "not-found");
  assert.equal(response.json().title, "Service not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("POST /v1/subscriptions/:id/services hides cross-tenant subscriptions as 404", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const foreign = await seedForeignSubscription(container);

  const response = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${foreign.subscriptionId}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor" },
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "not-found");
  assert.equal(response.json().title, "Subscription not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("DELETE /v1/subscriptions/:id/services/:serviceId hides cross-tenant subscriptions as 404", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const foreign = await seedForeignSubscription(container);

  const response = await app.inject({
    method: "DELETE",
    url: `/v1/subscriptions/${foreign.subscriptionId}/services/floor`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "not-found");
  assert.equal(response.json().title, "Subscription not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("POST /v1/subscriptions/upgrade changes the plan and recalculates entitlements", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const beforeEntitlements = await app.inject({
    method: "GET",
    url: `/v1/entitlements/${tenantId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  const beforeBranches = beforeEntitlements
    .json()
    .data.entitlements.find((e: { resource: string }) => e.resource === "branches");
  assert.equal(beforeBranches.hardLimit, 5);

  const response = await app.inject({
    method: "POST",
    url: "/v1/subscriptions/upgrade",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { planId: "ENTERPRISE", billingCycle: "ANNUALLY" },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "planCode",
      "status",
      "billingCycle",
      "startDate",
      "renewalDate",
      "currentPeriodStart",
      "currentPeriodEnd",
      "autoRenew",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data.planCode, "ENTERPRISE");
  assert.equal(response.json().data.billingCycle, "ANNUALLY");

  const afterEntitlements = await app.inject({
    method: "GET",
    url: `/v1/entitlements/${tenantId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  const afterBranches = afterEntitlements
    .json()
    .data.entitlements.find((e: { resource: string }) => e.resource === "branches");
  assert.equal(afterBranches.hardLimit, Number.MAX_SAFE_INTEGER);
  await app.close();
});

test("POST /v1/subscriptions/upgrade with an unknown plan returns 400", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/subscriptions/upgrade",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { planId: "BOGUS" },
  });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "bad-request");
  assert.equal(response.json().title, 'Unknown plan "BOGUS"');
  assert.equal(response.json().status, 400);
  await app.close();
});

test("POST /v1/subscriptions/upgrade as EMPLOYEE returns 403 (plan:upgrade is OWNER only)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  const now = new Date();
  const employee = {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    identityProvider: "fixture",
    externalIdentityId: "demo-employee-sub",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    tenantId,
    userId: employee.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "employee-token-sub";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee-sub",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "POST",
    url: "/v1/subscriptions/upgrade",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { planId: "ENTERPRISE" },
  });
  assert.equal(response.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "insufficient-scope");
  assert.equal(response.json().title, "Insufficient scope");
  assert.equal(response.json().status, 403);
  await app.close();
});

test("POST /v1/subscriptions/:id/services validates serviceId, quantity and unitPrice", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const subscription = await container.subscriptions.findByTenantId(tenantId);

  const emptyServiceId = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "" },
  });
  assert.equal(emptyServiceId.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(emptyServiceId.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(emptyServiceId.json().type, "bad-request");
  assert.equal(
    emptyServiceId.json().title,
    '[\n  {\n    "code": "too_small",\n    "minimum": 1,\n    "type": "string",\n    "inclusive": true,\n    "exact": false,\n    "message": "String must contain at least 1 character(s)",\n    "path": [\n      "serviceId"\n    ]\n  }\n]',
  );
  assert.equal(emptyServiceId.json().status, 400);

  const zeroQuantity = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor", quantity: 0 },
  });
  assert.equal(zeroQuantity.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(zeroQuantity.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(zeroQuantity.json().type, "bad-request");
  assert.equal(
    zeroQuantity.json().title,
    '[\n  {\n    "code": "too_small",\n    "minimum": 0,\n    "type": "number",\n    "inclusive": false,\n    "exact": false,\n    "message": "Number must be greater than 0",\n    "path": [\n      "quantity"\n    ]\n  }\n]',
  );
  assert.equal(zeroQuantity.json().status, 400);

  const negativeUnitPrice = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${subscription!.id}/services`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { serviceId: "floor", unitPrice: -1 },
  });
  assert.equal(negativeUnitPrice.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(negativeUnitPrice.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(negativeUnitPrice.json().type, "bad-request");
  assert.equal(
    negativeUnitPrice.json().title,
    '[\n  {\n    "code": "too_small",\n    "minimum": 0,\n    "type": "number",\n    "inclusive": true,\n    "exact": false,\n    "message": "Number must be greater than or equal to 0",\n    "path": [\n      "unitPrice"\n    ]\n  }\n]',
  );
  assert.equal(negativeUnitPrice.json().status, 400);
  await app.close();
});

test("POST /v1/subscriptions/upgrade validates billingCycle enum", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  const response = await app.inject({
    method: "POST",
    url: "/v1/subscriptions/upgrade",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { planId: "ENTERPRISE", billingCycle: "WEEKLY" },
  });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(response.json().type, "bad-request");
  assert.equal(
    response.json().title,
    `[\n  {\n    "received": "WEEKLY",\n    "code": "invalid_enum_value",\n    "options": [\n      "MONTHLY",\n      "ANNUALLY"\n    ],\n    "path": [\n      "billingCycle"\n    ],\n    "message": "Invalid enum value. Expected 'MONTHLY' | 'ANNUALLY', received 'WEEKLY'"\n  }\n]`,
  );
  assert.equal(response.json().status, 400);
  await app.close();
});
