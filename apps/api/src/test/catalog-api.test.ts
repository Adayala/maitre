import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

// SPEC-224 §5 — Fastify inject() covers SPEC-040 (Menus), SPEC-041
// (Categories) and SPEC-042 (Products).

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  return memberships[0]!.tenantId;
}

async function getBrandId(container: Container, tenantId: string): Promise<string> {
  const brands = await container.brands.listByTenant(tenantId);
  return brands[0]!.id;
}

test("GET /v1/brands/:brandId/menus lists the seeded menu", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: `/v1/brands/${brandId}/menus`,
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
  assert.equal(response.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(response.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "name",
      "slug",
      "status",
      "isDefault",
      "displayOrder",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data[0].name, "Menú Principal");
  await app.close();
});

test("POST /v1/brands/:brandId/menus creates a menu with a derived slug", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/menus`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Menú de Verano" },
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.slug, "menu-de-verano");
  await app.close();
});

test("POST /v1/brands/:brandId/menus with a duplicate name/slug returns 409", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/menus`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Menú Principal" },
  });
  assert.equal(response.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "detail", "instance", "code", "correlationId"]),
  );
  assert.equal(response.json().type, "https://docs.maitre.app/problems/conflict");
  assert.equal(
    response.json().detail,
    `Menu slug "menu-principal" already exists for brand ${brandId}`,
  );
  assert.equal(response.json().status, 409);
  await app.close();
});

test("GET /v1/menus/:id returns the menu with its categories embedded", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const menu = (
    await app.inject({
      method: "GET",
      url: `/v1/brands/${brandId}/menus`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];

  const response = await app.inject({
    method: "GET",
    url: `/v1/menus/${menu.id}`,
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
    new Set([
      "id",
      "tenantId",
      "brandId",
      "name",
      "slug",
      "status",
      "isDefault",
      "displayOrder",
      "createdAt",
      "updatedAt",
      "categories",
    ]),
  );
  assert.equal(response.json().data.categories.length, 1);
  assert.deepEqual(
    new Set(Object.keys(response.json().data.categories[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "brandId",
      "menuId",
      "name",
      "slug",
      "displayOrder",
      "status",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data.categories[0].name, "Entradas");
  await app.close();
});

test("PATCH /v1/menus/:id archives a menu", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const menu = (
    await app.inject({
      method: "GET",
      url: `/v1/brands/${brandId}/menus`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];

  const response = await app.inject({
    method: "PATCH",
    url: `/v1/menus/${menu.id}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { status: "ARCHIVED" },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.status, "ARCHIVED");
  await app.close();
});

test("POST /v1/menus/:menuId/categories creates a category", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const menu = (
    await app.inject({
      method: "GET",
      url: `/v1/brands/${brandId}/menus`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];

  const response = await app.inject({
    method: "POST",
    url: `/v1/menus/${menu.id}/categories`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Postres" },
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.slug, "postres");
  await app.close();
});

test("POST /v1/categories/:categoryId/products creates a product", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const menu = (
    await app.inject({
      method: "GET",
      url: `/v1/brands/${brandId}/menus`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];
  const category = (
    await app.inject({
      method: "GET",
      url: `/v1/menus/${menu.id}/categories`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];

  const response = await app.inject({
    method: "POST",
    url: `/v1/categories/${category.id}/products`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { name: "Provoleta", priceMinorUnits: 450000, currency: "ARS" },
  });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "categoryId",
      "name",
      "slug",
      "priceMinorUnits",
      "currency",
      "status",
      "allergens",
      "displayOrder",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ]),
  );
  assert.equal(response.json().data.status, "AVAILABLE");
  await app.close();
});

test("PATCH /v1/products/:id updates the price", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);
  const menu = (
    await app.inject({
      method: "GET",
      url: `/v1/brands/${brandId}/menus`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];
  const category = (
    await app.inject({
      method: "GET",
      url: `/v1/menus/${menu.id}/categories`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];
  const product = (
    await app.inject({
      method: "GET",
      url: `/v1/categories/${category.id}/products`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": tenantId,
      },
    })
  ).json().data[0];

  const response = await app.inject({
    method: "PATCH",
    url: `/v1/products/${product.id}`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { priceMinorUnits: 400000 },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "categoryId",
      "name",
      "slug",
      "priceMinorUnits",
      "currency",
      "status",
      "allergens",
      "displayOrder",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(response.json().data.priceMinorUnits, 400000);
  await app.close();
});

test("POST /v1/brands/:brandId/menus as EMPLOYEE returns 403 (menu:create not granted)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);

  const now = new Date();
  const employee = {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    identityProvider: "fixture",
    externalIdentityId: "demo-employee-catalog",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
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
  const token = "employee-token-catalog";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee-catalog",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/menus`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { name: "Should Fail" },
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("GET .../menus as EMPLOYEE succeeds (menu:read is granted per SPEC-043)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
  const brandId = await getBrandId(container, tenantId);
  const app = await buildApp(container);

  const now = new Date();
  const employee = {
    id: "11111111-2222-3333-4444-555555555555",
    identityProvider: "fixture",
    externalIdentityId: "demo-employee-catalog-read",
    displayName: "Demo Employee",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: "66666666-7777-8888-9999-aaaaaaaaaaaa",
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
  const token = "employee-token-catalog-read";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-employee-catalog-read",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "GET",
    url: `/v1/brands/${brandId}/menus`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(response.statusCode, 200);
  await app.close();
});
