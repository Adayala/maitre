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
  assert.deepEqual(response.json().data, []);
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
  assert.equal(response.json().data.length, 2);
  assert.equal(response.json().data[0].action, "UPDATE"); // most recent first
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
  await app.close();
});
