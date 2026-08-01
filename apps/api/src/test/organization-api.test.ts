import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  InMemoryOutboxRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
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
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  return token;
}

async function seedManager(container: Container, tenantId: string) {
  const now = new Date();
  const user = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-manager",
    displayName: "Demo Manager",
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
    roleIds: ["role_manager"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "manager-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-manager",
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "name",
      "slug",
      "status",
      "config",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ]),
  );
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  assert.equal(response.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "name",
      "slug",
      "status",
      "config",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data[0].name, "Maitre Demo Brand");
  assert.deepEqual(
    new Set(Object.keys(response.json().meta as Record<string, unknown>)),
    new Set(["total", "limit", "offset"]),
  );
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(response.json().detail, "Brand not found");
  assert.equal(response.json().status, 404);
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
    payload: {
      name: "La Parrilla S.A.",
      cuit: "20-12345678-6",
      taxCondition: "RI",
      legalAddress: "Calle 1",
      fiscalAddress: "Calle 1",
      activityCode: "561011",
    },
  });
  assert.equal(response.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
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
    payload: {
      name: "La Parrilla S.A.",
      cuit: "27-12345678-0",
      taxCondition: "RI",
      legalAddress: "Calle 1",
      fiscalAddress: "Calle 1",
      activityCode: "561011",
    },
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.cuit, "27123456780");
  assert.equal(response.json().data.legalAddress, "Calle 1");
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
    payload: {
      name: "La Parrilla S.A.",
      cuit: "27-12345678-0",
      taxCondition: "RI",
      legalAddress: "Calle 1",
      fiscalAddress: "Calle 1",
      activityCode: "561011",
    },
  });
  const response = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: { name: "Otra Razón Social", cuit: "27-12345678-0", taxCondition: "RI" },
  });
  assert.equal(response.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/conflict");
  assert.equal(
    response.json().detail,
    `CUIT "27123456780" already exists for tenant ${tenantId}`,
  );
  assert.equal(response.json().status, 409);
  await app.close();
});

test("GET /v1/fiscal-entities lists the seeded fiscal entity", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/fiscal-entities",
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
    new Set([
      "id",
      "tenantId",
      "cuit",
      "legalName",
      "name",
      "createIdempotencyKey",
      "status",
      "taxCondition",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data[0].name, "Maitre Demo Fiscal Entity");
  assert.equal(response.json().data[0].cuit, "20123456786");
  assert.deepEqual(
    new Set(Object.keys(response.json().meta as Record<string, unknown>)),
    new Set(["total", "limit", "offset"]),
  );
  assert.equal(response.json().meta.total, 1);
  await app.close();
});

test("POST /v1/fiscal-entities is idempotent with Idempotency-Key", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
    "idempotency-key": "fiscal-create-idem-1",
  };

  const first = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: {
      name: "Fiscal Replay",
      cuit: "27-12345678-0",
      taxCondition: "RI",
      legalAddress: "Calle 1",
    },
  });
  assert.equal(first.statusCode, 201);

  const replay = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: {
      name: "Fiscal Replay Diferente",
      cuit: "27-12345678-0",
      taxCondition: "MONOTRIBUTISTA",
      legalAddress: "Otra calle",
    },
  });
  assert.equal(replay.statusCode, 201);
  assert.equal(replay.json().data.id, first.json().data.id);
  assert.equal(replay.json().data.cuit, first.json().data.cuit);
});

test("GET /v1/fiscal-entities lists tenant-owned entities and detail returns ETag", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };

  const list = await app.inject({
    method: "GET",
    url: "/v1/fiscal-entities",
    headers,
  });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().meta.total >= 1, true);
  const entityId = list.json().data[0].id;

  const detail = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers,
  });
  assert.equal(detail.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(detail.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.deepEqual(
    new Set(Object.keys(detail.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "cuit",
      "legalName",
      "name",
      "createIdempotencyKey",
      "status",
      "taxCondition",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(typeof detail.headers.etag, "string");

  await app.close();
});

test("GET /v1/fiscal-entities as MANAGER returns redacted fiscal fields", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const managerToken = await seedManager(container, tenantId);
  const app = await buildApp(container);
  const ownerHeaders = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };

  const created = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers: ownerHeaders,
    payload: {
      name: "Fiscal Redacted",
      cuit: "30-12345678-1",
      taxCondition: "RI",
      legalAddress: "Privada 123",
      fiscalAddress: "Fiscal 456",
      activityCode: "561011",
    },
  });
  assert.equal(created.statusCode, 201);
  const entityId = created.json().data.id;

  const list = await app.inject({
    method: "GET",
    url: "/v1/fiscal-entities",
    headers: { authorization: `Bearer ${managerToken}`, "x-tenant-id": tenantId },
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(list.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  const listed = list.json().data.find((item: { id: string }) => item.id === entityId);
  assert.ok(listed);
  assert.deepEqual(
    new Set(Object.keys(listed as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "cuit",
      "legalName",
      "name",
      "status",
      "taxCondition",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ]),
  );
  assert.equal("legalAddress" in listed, false);
  assert.equal("fiscalAddress" in listed, false);
  assert.equal("activityCode" in listed, false);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { authorization: `Bearer ${managerToken}`, "x-tenant-id": tenantId },
  });
  assert.equal(detail.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(detail.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.equal(detail.json().data.name, "Fiscal Redacted");
  assert.deepEqual(
    new Set(Object.keys(detail.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "cuit",
      "legalName",
      "name",
      "status",
      "taxCondition",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ]),
  );
  assert.equal("legalAddress" in detail.json().data, false);
  assert.equal("fiscalAddress" in detail.json().data, false);
  assert.equal("activityCode" in detail.json().data, false);
  assert.equal(typeof detail.headers.etag, "string");

  await app.close();
});

test("PATCH /v1/fiscal-entities requires valid If-Match and rejects stale revisions", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const list = await app.inject({
    method: "GET",
    url: "/v1/fiscal-entities",
    headers,
  });
  assert.equal(list.statusCode, 200);
  const entityId = list.json().data[0].id;

  const missingIfMatch = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers,
    payload: { name: "Nope" },
  });
  assert.equal(missingIfMatch.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(missingIfMatch.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missingIfMatch.json().type, "https://docs.maitre.app/problems/bad-request");
  assert.equal(missingIfMatch.json().detail, "Missing If-Match header");
  assert.equal(missingIfMatch.json().status, 400);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers,
  });
  const etag = detail.headers.etag as string;

  const patched = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { ...headers, "if-match": etag, "x-step-up-at": new Date().toISOString() },
    payload: {
      name: "Fiscal Dos Actualizada",
      legalAddress: "Dir nueva",
      fiscalAddress: "Fiscal nueva",
      activityCode: "563001",
      taxCondition: "MONOTRIBUTISTA",
      reason: "Actualización fiscal autorizada",
    },
  });
  assert.equal(patched.statusCode, 200);
  assert.equal(patched.json().data.name, "Fiscal Dos Actualizada");
  assert.equal(patched.json().data.legalAddress, "Dir nueva");
  assert.equal(patched.json().data.taxCondition, "MONOTRIBUTISTA");

  const stalePatch = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { ...headers, "if-match": etag },
    payload: { name: "Stale" },
  });
  assert.equal(stalePatch.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(stalePatch.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(stalePatch.json().type, "https://docs.maitre.app/problems/conflict");
  assert.equal(stalePatch.json().status, 409);

  await app.close();
});

test("PATCH /v1/fiscal-entities sensitive changes require reason and recent step-up", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const created = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: {
      name: "Fiscal StepUp",
      cuit: "30-12345678-1",
      taxCondition: "RI",
      legalAddress: "Antes 123",
    },
  });
  const entityId = created.json().data.id;
  const detail = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers,
  });
  const etag = detail.headers.etag as string;

  const missingReason = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { ...headers, "if-match": etag, "x-step-up-at": new Date().toISOString() },
    payload: { legalAddress: "Nueva 123" },
  });
  assert.equal(missingReason.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(missingReason.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missingReason.json().type, "https://docs.maitre.app/problems/bad-request");
  assert.equal(missingReason.json().detail, "Missing reason for sensitive fiscal change");
  assert.equal(missingReason.json().status, 400);

  const missingStepUp = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { ...headers, "if-match": etag },
    payload: { legalAddress: "Nueva 123", reason: "Cambio de domicilio fiscal" },
  });
  assert.equal(missingStepUp.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(missingStepUp.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(missingStepUp.json().type, "https://docs.maitre.app/problems/step-up-required");
  assert.equal(missingStepUp.json().detail, "Step-up required");
  assert.equal(missingStepUp.json().status, 403);

  const nameOnly = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { ...headers, "if-match": etag },
    payload: { name: "Fiscal Solo Nombre" },
  });
  assert.equal(nameOnly.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(nameOnly.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.equal(nameOnly.json().data.name, "Fiscal Solo Nombre");
  assert.equal(nameOnly.json().data.legalAddress, "Antes 123");

  await app.close();
});

test("GET and PATCH /v1/fiscal-entities hide cross-tenant resources as 404", async () => {
  const ownerContainer = await buildContainer();
  const tenantId = await getTenantId(ownerContainer);
  const app = await buildApp(ownerContainer);
  const ownerHeaders = {
    authorization: `Bearer ${ownerContainer.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const ownerList = await app.inject({
    method: "GET",
    url: "/v1/fiscal-entities",
    headers: ownerHeaders,
  });
  assert.equal(ownerList.statusCode, 200);
  const entityId = ownerList.json().data[0].id;
  const now = new Date();
  const otherTenantId = randomUUID();
  await ownerContainer.tenants.save({
    id: otherTenantId,
    name: "Other Tenant",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  const otherUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "other-owner-fiscal",
    displayName: "Other Owner Fiscal",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await ownerContainer.users.save(otherUser);
  await ownerContainer.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: otherUser.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const otherToken = "other-owner-fiscal-token";
  sessionsOf(ownerContainer).registerToken(otherToken, {
    provider: "fixture",
    subject: otherUser.externalIdentityId,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const hiddenGet = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: { authorization: `Bearer ${otherToken}`, "x-tenant-id": otherTenantId },
  });
  assert.equal(hiddenGet.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(hiddenGet.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(hiddenGet.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(hiddenGet.json().detail, "FiscalEntity not found");
  assert.equal(hiddenGet.json().status, 404);

  const hiddenPatch = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: {
      authorization: `Bearer ${otherToken}`,
      "x-tenant-id": otherTenantId,
      "if-match": `"0"`,
    },
    payload: { name: "Hidden" },
  });
  assert.equal(hiddenPatch.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(hiddenPatch.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(hiddenPatch.json().type, "https://docs.maitre.app/problems/not-found");
  assert.equal(hiddenPatch.json().detail, "FiscalEntity not found");
  assert.equal(hiddenPatch.json().status, 404);

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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  assert.deepEqual(
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "salonId",
      "number",
      "capacity",
      "createdAt",
      "updatedAt",
      "status",
    ]),
  );
  assert.equal(response.json().data[0].status, "AVAILABLE");
  assert.deepEqual(
    new Set(Object.keys(response.json().meta as Record<string, unknown>)),
    new Set(["total", "limit", "offset"]),
  );
  assert.equal(response.json().meta.total, response.json().data.length);
  assert.equal(response.json().meta.total >= 1, true);
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data", "meta"]),
  );
  assert.equal(response.json().data[0].status, "AVAILABLE");
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["data"]),
  );
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "name",
      "status",
      "defaultLocale",
      "defaultCurrency",
      "defaultTimezone",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ]),
  );
  const tenantId = response.json().data.id;

  const meResponse = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });
  const tenantIds = meResponse.json().tenants.map((t: { id: string }) => t.id);
  assert.ok(tenantIds.includes(tenantId));
  const createdTenant = meResponse
    .json()
    .tenants.find((t: { id: string }) => t.id === tenantId);
  assert.ok(createdTenant);
  assert.deepEqual(createdTenant.branches, []);
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
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/insufficient-scope");
  assert.equal(response.json().detail, "Insufficient scope");
  assert.equal(response.json().status, 403);
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

test("POST /v1/fiscal-entities appends FiscalEntityCreated to the outbox and writes sanitized audit", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const beforeOutbox = outboxOf(container).all().length;
  const response = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: {
      name: "Fiscal Audit",
      cuit: "30-12345678-1",
      taxCondition: "RI",
      legalAddress: "Privada 123",
      fiscalAddress: "Fiscal 456",
      activityCode: "561011",
    },
  });
  assert.equal(response.statusCode, 201);
  const records = outboxOf(container).all();
  assert.equal(records.length, beforeOutbox + 1);
  assert.equal(records[records.length - 1]!.eventName, "FiscalEntityCreated");
  assert.equal(records[records.length - 1]!.aggregateId, response.json().data.id);
  const auditPage = await container.auditLogs.query({ tenantId, resourceType: "FISCAL_ENTITY" });
  assert.equal(auditPage.items.length, 1);
  assert.equal(auditPage.items[0]!.action, "CREATE");
  const auditState = auditPage.items[0]!.newState as { cuitMasked?: string; hasLegalAddress?: boolean };
  assert.equal(auditState.cuitMasked, "***6781");
  assert.equal(auditState.hasLegalAddress, true);
  assert.equal("legalAddress" in (auditPage.items[0]!.newState as object), false);
  await app.close();
});

test("PATCH /v1/fiscal-entities writes sanitized audit diff", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const created = await app.inject({
    method: "POST",
    url: "/v1/fiscal-entities",
    headers,
    payload: {
      name: "Fiscal Audit Patch",
      cuit: "27-12345678-0",
      taxCondition: "RI",
      legalAddress: "Antes 1",
    },
  });
  const entityId = created.json().data.id;
  const detail = await app.inject({
    method: "GET",
    url: `/v1/fiscal-entities/${entityId}`,
    headers,
  });
  const patch = await app.inject({
    method: "PATCH",
    url: `/v1/fiscal-entities/${entityId}`,
    headers: {
      ...headers,
      "if-match": detail.headers.etag as string,
      "x-step-up-at": new Date().toISOString(),
    },
    payload: {
      name: "Fiscal Audit Patch 2",
      activityCode: "561099",
      reason: "Alta de código de actividad",
    },
  });
  assert.equal(patch.statusCode, 200);
  const auditPage = await container.auditLogs.query({ tenantId, resourceType: "FISCAL_ENTITY" });
  assert.equal(auditPage.items.length >= 2, true);
  const updateEntry = auditPage.items.find((item) => item.action === "UPDATE" && item.resourceId === entityId);
  assert.ok(updateEntry);
  const previousState = updateEntry!.previousState as { cuitMasked?: string; hasActivityCode?: boolean };
  const newState = updateEntry!.newState as { cuitMasked?: string; hasActivityCode?: boolean };
  assert.equal(previousState.cuitMasked, "***6780");
  assert.equal(previousState.hasActivityCode, false);
  assert.equal(newState.hasActivityCode, true);
  assert.equal("activityCode" in (newState as object), false);
  await app.close();
});
