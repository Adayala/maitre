import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";

// SPEC-224 §5 — Fastify inject() covers SPEC-046 (Setup Status) and
// SPEC-047 (Overview).

async function getTenantId(container: Container): Promise<string> {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
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
  const setup = response.json().data.setup;
  assert.equal(setup.tenant.status, "COMPLETE");
  assert.equal(setup.brands.status, "COMPLETE");
  assert.equal(setup.branches.status, "COMPLETE");
  assert.equal(setup.menus.status, "COMPLETE");
  assert.equal(setup.products.status, "COMPLETE");
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
  const setup = response.json().data.setup;
  assert.equal(setup.tenant.status, "COMPLETE");
  assert.equal(setup.brands.status, "INCOMPLETE");
  assert.equal(setup.brands.count, 0);
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
  await app.close();
});

test("GET /v1/dashboard/overview reports setup AVAILABLE and operations UNAVAILABLE (Fase 2 not implemented)", async () => {
  const container = await buildContainer();
  const tenantId = await getTenantId(container);
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
  assert.equal(body.setup.brandCount, 1);
  assert.equal(body.operations.status, "UNAVAILABLE");
  assert.equal(body.operations.openVisits, null);
  await app.close();
});
