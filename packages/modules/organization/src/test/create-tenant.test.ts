import { test } from "node:test";
import assert from "node:assert/strict";
import { createTenant } from "../application/create-tenant.js";
import { FakeTenantRepository } from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

test("createTenant creates an ACTIVE tenant with the given defaults", async () => {
  const tenants = new FakeTenantRepository();
  const tenant = await createTenant(
    { tenants, now: () => now },
    {
      name: "Acme",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
    },
  );

  assert.equal(tenant.status, "ACTIVE");
  assert.equal(tenant.name, "Acme");
  assert.equal(tenant.createdAt, now);
});

test("createTenant persists the tenant so it can be found afterward", async () => {
  const tenants = new FakeTenantRepository();
  const tenant = await createTenant(
    { tenants, now: () => now },
    {
      name: "Acme",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
    },
  );

  const found = await tenants.findById(tenant.id);
  assert.deepEqual(found, tenant);
});
