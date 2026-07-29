import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  InMemoryOutboxRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";

// SPEC-224 §5 — Fastify inject() covers SPEC-021 (Users) and SPEC-022 (Roles).

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

test("POST /v1/users invites a user: creates User + INVITED Membership", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/users",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { email: "waiter@demo.maitre", name: "New Waiter" },
  });
  assert.equal(response.statusCode, 201);
  const body = response.json().data;
  assert.deepEqual(
    new Set(Object.keys(body as Record<string, unknown>)),
    new Set(["id", "email", "name", "status", "membershipId", "roleIds"]),
  );
  assert.equal(body.status, "INVITED");
  assert.equal(body.email, "waiter@demo.maitre");
  assert.deepEqual(body.roleIds, ["role_employee"]);
  await app.close();
});

test("POST /v1/users appends UserInvited to the outbox", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const before = outboxOf(container).all().length;
  await app.inject({
    method: "POST",
    url: "/v1/users",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { email: "waiter2@demo.maitre", name: "Another Waiter" },
  });
  const records = outboxOf(container).all();
  assert.equal(records.length, before + 1);
  assert.equal(records[records.length - 1]!.eventName, "UserInvited");
  await app.close();
});

test("POST /v1/users as EMPLOYEE returns 403 (user:create not granted)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);

  const now = new Date();
  const employee = {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    identityProvider: "fixture",
    externalIdentityId: "demo-employee",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
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
  const token = "employee-token-users";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "POST",
    url: "/v1/users",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { email: "x@demo.maitre", name: "X" },
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

test("GET /v1/users lists the seeded owner", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/users",
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
  assert.equal(response.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set(["id", "email", "name", "status", "membershipId", "roleIds"]),
  );
  assert.equal(response.json().data[0].name, "Demo Owner");
  assert.deepEqual(
    new Set(Object.keys(response.json().meta as Record<string, unknown>)),
    new Set(["total", "limit", "offset"]),
  );
  assert.equal(response.json().meta.total, 1);
  await app.close();
});

test("GET /v1/users/:id returns 404 for an unknown id", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/users/00000000-0000-0000-0000-000000000099",
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
  assert.equal(response.json().title, "User not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("PATCH /v1/users/:id updates the display name", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const response = await app.inject({
    method: "PATCH",
    url: `/v1/users/${owner!.id}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Renamed Owner" },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set(["id", "email", "name", "status", "membershipId", "roleIds"]),
  );
  assert.equal(response.json().data.name, "Renamed Owner");
  await app.close();
});

test("PATCH /v1/users/:id updates the authoritative membership profile and status", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const response = await app.inject({
    method: "PATCH",
    url: `/v1/users/${owner!.id}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { roleIds: ["role_employee"], membershipStatus: "SUSPENDED" },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.status, "SUSPENDED");
  assert.deepEqual(response.json().data.roleIds, ["role_employee"]);
  const memberships = await container.memberships.listByUser(owner!.id);
  assert.equal(memberships[0]?.status, "SUSPENDED");
  assert.deepEqual(memberships[0]?.roleIds, ["role_employee"]);
  await app.close();
});

test("GET /v1/roles lists the predefined role catalog", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/roles",
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
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set(["id", "name", "description", "permissions"]),
  );
  const ids = response.json().data.map((r: { id: string }) => r.id);
  assert.ok(ids.includes("role_owner"));
  assert.ok(ids.includes("role_admin"));
  await app.close();
});

test("GET /v1/roles/:id returns 404 for an unknown role", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/roles/role_does_not_exist",
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
  assert.equal(response.json().title, "Role not found");
  assert.equal(response.json().status, 404);
  await app.close();
});

test("GET /v1/permissions lists every permission id referenced by a role, excluding the wildcard", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/permissions",
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
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set(["id", "resource", "action"]),
  );
  const ids = response.json().data.map((p: { id: string }) => p.id);
  assert.ok(ids.includes("user:read"));
  assert.ok(!ids.includes("*"));
  await app.close();
});
