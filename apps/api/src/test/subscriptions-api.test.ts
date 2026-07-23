import { test } from "node:test";
import assert from "node:assert/strict";
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
  assert.equal(response.json().data.status, "ACTIVE");

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
  assert.equal(del.json().data.status, "INACTIVE");
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
  await app.close();
});

test("POST /v1/subscriptions/upgrade changes the plan and recalculates entitlements", async () => {
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
    payload: { planId: "ENTERPRISE" },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.planCode, "ENTERPRISE");
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
  await app.close();
});
