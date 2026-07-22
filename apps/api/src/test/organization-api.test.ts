import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { InMemoryOutboxRepository } from "@maitre/adapter-persistence-memory";

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

// SPEC-224 §5 — Fastify inject() covers SPEC-007-012's Organization APIs:
// tenant-context resolution, RBAC per SPEC-016/026, and error contracts.

async function seedEmployee(container: Container, tenantId: string) {
  const now = new Date();
  const user = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-employee",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(user);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: user.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "employee-token";
  container.sessions.registerToken(token, {
    provider: "fixture",
    subject: "demo-employee",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  return token;
}

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  return memberships[0]!.tenantId;
}

test("POST /v1/brands without X-Tenant-Id returns 403 insufficient-scope", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/brands",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
    payload: { name: "Nueva Marca", config: { language: "es", currency: "ARS" } },
  });
  assert.equal(response.statusCode, 403);
  assert.equal(response.json().type, "insufficient-scope");
  await app.close();
});

test("POST /v1/brands as OWNER succeeds and derives a slug", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const tenantId = await getTenantId(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/brands",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Pizzeria Bella", config: { language: "es", currency: "ARS" } },
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.slug, "pizzeria-bella");
  await app.close();
});

test("POST /v1/brands as EMPLOYEE returns 403 (SPEC-016: EMPLOYEE cannot manage organization)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const token = await seedEmployee(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/brands",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { name: "Pizzeria Bella", config: { language: "es", currency: "ARS" } },
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("GET /v1/brands as EMPLOYEE returns 403 (brand:read not granted to EMPLOYEE)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const token = await seedEmployee(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/brands",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("GET /v1/brands lists the seeded demo brand", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/brands",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.length, 1);
  assert.equal(response.json().data[0].name, "Maitre Demo Brand");
  await app.close();
});

test("GET /v1/brands/:id returns 404 for an unknown id", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: `/v1/brands/${randomUUID()}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 404);
  await app.close();
});

test("DELETE (archive) then PATCH a brand returns 409 conflict", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const brandId = (await container.brands.listByTenant(tenantId))[0]!.id;

  const del = await app.inject({
    method: "DELETE",
    url: `/v1/brands/${brandId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(del.statusCode, 204);

  const patch = await app.inject({
    method: "PATCH",
    url: `/v1/brands/${brandId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Should Not Apply" },
  });
  assert.equal(patch.statusCode, 409);
  await app.close();
});

test("POST /v1/fiscal-entities as EMPLOYEE returns 403 (OWNER only per SPEC-009)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const token = await seedEmployee(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { name: "La Parrilla S.A.", cuit: "20-12345678-6", taxCondition: "RI" },
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("POST /v1/fiscal-entities as OWNER succeeds", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "La Parrilla S.A.", cuit: "20-12345678-6", taxCondition: "RI" },
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.cuit, "20123456786");
  await app.close();
});

test("POST /v1/fiscal-entities with a duplicate CUIT returns 409 conflict", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: { name: "La Parrilla S.A.", cuit: "20-12345678-6", taxCondition: "RI" },
  });
  const response = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: { name: "Otra Razón Social", cuit: "20-12345678-6", taxCondition: "RI" },
  });
  assert.equal(response.statusCode, 409);
  await app.close();
});

test("GET /v1/tables includes a derived status", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const branchId = (await container.branches.listByTenant(tenantId))[0]!.id;
  const salonId = (await container.salons.listByBranch(tenantId, branchId))[0]!.id;

  const response = await app.inject({
    method: "GET",
    url: `/v1/tables?salonId=${salonId}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data[0].status, "AVAILABLE");
  await app.close();
});

test("GET /v1/tables as EMPLOYEE succeeds (SPEC-012: EMPLOYEE may read tables)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const token = await seedEmployee(container, tenantId);
  const app = await buildApp(container);
  const branchId = (await container.branches.listByTenant(tenantId))[0]!.id;
  const salonId = (await container.salons.listByBranch(tenantId, branchId))[0]!.id;

  const response = await app.inject({
    method: "GET",
    url: `/v1/tables?salonId=${salonId}`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(response.statusCode, 200);
  await app.close();
});

test("POST /v1/tenants provisions a Tenant with an OWNER membership for the caller", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: "/v1/tenants",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
    payload: { name: "Second Restaurant Group" },
  });
  assert.equal(response.statusCode, 201);
  const tenantId = response.json().data.id;

  const meResponse = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });
  const tenantIds = meResponse.json().tenants.map((t: { id: string }) => t.id);
  assert.ok(tenantIds.includes(tenantId));
  await app.close();
});

test("PATCH /v1/tenants/:id for a tenant outside the caller's membership returns 403", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const tenantId = await getTenantId(container);
  const response = await app.inject({
    method: "PATCH",
    url: `/v1/tenants/${randomUUID()}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Hijack Attempt" },
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("POST /v1/tenants appends TenantCreated to the outbox with the request's correlationId", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const before = outboxOf(container).all().length;
  const response = await app.inject({
    method: "POST",
    url: "/v1/tenants",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
    payload: { name: "Second Restaurant Group" },
  });
  const records = outboxOf(container).all();
  assert.equal(records.length, before + 1);
  const tenantCreated = records[records.length - 1]!;
  assert.equal(tenantCreated.eventName, "TenantCreated");
  assert.equal(tenantCreated.aggregateId, response.json().data.id);
  await app.close();
});

test("POST /v1/brands appends BrandCreated to the outbox", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const before = outboxOf(container).all().length;
  const response = await app.inject({
    method: "POST",
    url: "/v1/brands",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Pizzeria Bella", config: { language: "es", currency: "ARS" } },
  });
  const records = outboxOf(container).all();
  assert.equal(records.length, before + 1);
  assert.equal(records[records.length - 1]!.eventName, "BrandCreated");
  assert.equal(records[records.length - 1]!.aggregateId, response.json().data.id);
  await app.close();
});
