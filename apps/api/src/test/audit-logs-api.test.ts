import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-224 §5 — Fastify inject() covers SPEC-045 (Audit API).

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  return memberships[0]!.tenantId;
}

test("GET /v1/audit-logs returns an empty list when nothing has been recorded", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/audit-logs",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  assert.deepEqual(response.json().data, []);
  assert.deepEqual(
    new Set(Object.keys(response.json().meta as Record<string, unknown>)),
    new Set(["limit"]),
  );
  assert.equal(response.json().meta.limit, 100);
  await app.close();
});

test("GET /v1/audit-logs returns entries appended via the repository, filtered and ordered", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  await container.auditLogs.append({
    id: "11111111-1111-1111-1111-111111111111",
    tenantId,
    actorType: "USER",
    actorId: "user-1",
    action: "CREATE",
    resourceType: "Branch",
    resourceId: "branch-1",
    occurredAt: new Date("2026-01-01T00:00:00Z"),
  });
  await container.auditLogs.append({
    id: "22222222-2222-2222-2222-222222222222",
    tenantId,
    actorType: "USER",
    actorId: "user-1",
    action: "UPDATE",
    resourceType: "Branch",
    resourceId: "branch-1",
    occurredAt: new Date("2026-02-01T00:00:00Z"),
  });

  const response = await app.inject({
    method: "GET",
    url: "/v1/audit-logs?actor_id=user-1",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  assert.equal(response.json().data.length, 2);
  assert.deepEqual(
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set(["id", "tenantId", "actorType", "actorId", "action", "resourceType", "resourceId", "occurredAt"]),
  );
  assert.equal(response.json().data[0].action, "UPDATE"); // most recent first
  assert.equal(response.json().meta.limit, 100);
  await app.close();
});

test("GET /v1/audit-logs supports resource_type, from/to, limit clamp and cursor pagination", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  await container.auditLogs.append({
    id: "11111111-1111-1111-1111-111111111111",
    tenantId,
    actorType: "USER",
    actorId: "user-1",
    action: "CREATE",
    resourceType: "Branch",
    resourceId: "branch-1",
    occurredAt: new Date("2026-01-01T00:00:00Z"),
  });
  await container.auditLogs.append({
    id: "22222222-2222-2222-2222-222222222222",
    tenantId,
    actorType: "USER",
    actorId: "user-2",
    action: "UPDATE",
    resourceType: "Menu",
    resourceId: "menu-1",
    occurredAt: new Date("2026-02-01T00:00:00Z"),
  });
  await container.auditLogs.append({
    id: "33333333-3333-3333-3333-333333333333",
    tenantId,
    actorType: "USER",
    actorId: "user-3",
    action: "DELETE",
    resourceType: "Branch",
    resourceId: "branch-2",
    occurredAt: new Date("2026-03-01T00:00:00Z"),
  });

  const byResource = await app.inject({
    method: "GET",
    url: "/v1/audit-logs?resource_type=Branch",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(byResource.statusCode, 200);
  assert.equal(byResource.json().data.length, 2);
  assert.equal(byResource.json().data[0].resourceType, "Branch");
  assert.equal(byResource.json().data[1].resourceType, "Branch");

  const ranged = await app.inject({
    method: "GET",
    url: "/v1/audit-logs?from=2026-01-15T00:00:00Z&to=2026-02-15T00:00:00Z",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(ranged.statusCode, 200);
  assert.equal(ranged.json().data.length, 1);
  assert.equal(ranged.json().data[0].resourceType, "Menu");

  const firstPage = await app.inject({
    method: "GET",
    url: "/v1/audit-logs?limit=1",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(firstPage.statusCode, 200);
  assert.equal(firstPage.json().data.length, 1);
  assert.equal(typeof firstPage.json().meta.nextCursor, "string");
  assert.equal(firstPage.json().meta.limit, 1);

  const secondPage = await app.inject({
    method: "GET",
    url: `/v1/audit-logs?limit=1&cursor=${firstPage.json().meta.nextCursor}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(secondPage.statusCode, 200);
  assert.equal(secondPage.json().data.length, 1);
  assert.notEqual(secondPage.json().data[0].id, firstPage.json().data[0].id);

  const clamped = await app.inject({
    method: "GET",
    url: "/v1/audit-logs?limit=9999",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(clamped.statusCode, 200);
  assert.equal(clamped.json().meta.limit, 500);

  await app.close();
});

test("GET /v1/audit-logs filters sensitive evidence metadata", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const branchId = (await container.branches.listByTenant(tenantId))[0]!.id;
  const app = await buildApp(container);

  await container.auditLogs.append({
    id: "44444444-4444-4444-8444-444444444444",
    tenantId,
    actorType: "USER",
    actorId: "55555555-5555-4555-8555-555555555555",
    action: "UPDATE",
    actionCode: "CASH_POST_PAYMENTS",
    outcome: "SUCCEEDED",
    branchId,
    reasonCode: "HTTP_SUCCESS",
    requestId: "req-sensitive-1",
    resourceType: "PAYMENTS",
    resourceId: "66666666-6666-4666-8666-666666666666",
    correlationId: "77777777-7777-4777-8777-777777777777",
    occurredAt: new Date("2026-07-30T12:00:00Z"),
  });

  const response = await app.inject({
    method: "GET",
    url:
      `/v1/audit-logs?branch_id=${branchId}` +
      "&action_code=CASH_POST_PAYMENTS&outcome=SUCCEEDED" +
      "&resource_id=66666666-6666-4666-8666-666666666666" +
      "&correlation_id=77777777-7777-4777-8777-777777777777",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.length, 1);
  assert.equal(response.json().data[0].actionCode, "CASH_POST_PAYMENTS");
  assert.equal(response.json().data[0].outcome, "SUCCEEDED");
  assert.equal(response.json().data[0].branchId, branchId);
  await app.close();
});

test("GET /v1/audit-logs requires tenant context (403 without X-Tenant-Id)", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);

  const response = await app.inject({
    method: "GET",
    url: "/v1/audit-logs",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
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

test("GET /v1/audit-logs as EMPLOYEE returns 403 (audit:read is OWNER/ADMIN only)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  const now = new Date();
  const employee = {
    id: "33333333-3333-3333-3333-333333333333",
    identityProvider: "fixture",
    externalIdentityId: "demo-employee-audit",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: "44444444-4444-4444-4444-444444444444",
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
  const token = "employee-token-audit";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee-audit",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "GET",
    url: "/v1/audit-logs",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
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
