import { test } from "node:test";
import assert from "node:assert/strict";
import { createBrand } from "../application/create-brand.js";
import { TenantNotOperableError } from "../application/errors.js";
import { DuplicateBrandSlugError } from "../application/create-brand.js";
import {
  FakeTenantRepository,
  FakeBrandRepository,
  FakeOutboxRepository,
  aTenant,
} from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

test("createBrand succeeds for an ACTIVE tenant and derives a slug", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const brands = new FakeBrandRepository();

  const brand = await createBrand(
    { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      name: "La Parrilla",
      config: { language: "es", currency: "ARS" },
    },
  );

  assert.equal(brand.slug, "la-parrilla");
  assert.equal(brand.status, "ACTIVE");
  assert.equal(brand.createdAt, now);
});

test("createBrand rejects a missing tenant", async () => {
  const tenants = new FakeTenantRepository([]);
  const brands = new FakeBrandRepository();

  await assert.rejects(
    createBrand(
      { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
      {
        tenantId: "does-not-exist",
        name: "La Parrilla",
        config: { language: "es", currency: "ARS" },
      },
    ),
    TenantNotOperableError,
  );
});

test("createBrand rejects a suspended tenant", async () => {
  const tenants = new FakeTenantRepository([aTenant({ status: "SUSPENDED" })]);
  const brands = new FakeBrandRepository();

  await assert.rejects(
    createBrand(
      { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
      {
        tenantId: "11111111-1111-1111-1111-111111111111",
        name: "La Parrilla",
        config: { language: "es", currency: "ARS" },
      },
    ),
    TenantNotOperableError,
  );
});

test("createBrand rejects a duplicate slug within the same tenant", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const brands = new FakeBrandRepository();
  await createBrand(
    { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      name: "La Parrilla",
      config: { language: "es", currency: "ARS" },
    },
  );

  await assert.rejects(
    createBrand(
      { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
      {
        tenantId: "11111111-1111-1111-1111-111111111111",
        name: "La Parrilla",
        config: { language: "es", currency: "ARS" },
      },
    ),
    DuplicateBrandSlugError,
  );
});

test("createBrand allows the same slug across different tenants", async () => {
  const tenants = new FakeTenantRepository([
    aTenant({ id: "11111111-1111-1111-1111-111111111111" }),
    aTenant({ id: "99999999-9999-9999-9999-999999999999" }),
  ]);
  const brands = new FakeBrandRepository();
  await createBrand(
    { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      name: "La Parrilla",
      config: { language: "es", currency: "ARS" },
    },
  );

  const secondBrand = await createBrand(
    { tenants, brands, outbox: new FakeOutboxRepository(), now: () => now },
    {
      tenantId: "99999999-9999-9999-9999-999999999999",
      name: "La Parrilla",
      config: { language: "es", currency: "ARS" },
    },
  );

  assert.equal(secondBrand.slug, "la-parrilla");
});

test("createBrand appends BrandCreated to the outbox (SPEC-014/217)", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const brands = new FakeBrandRepository();
  const outbox = new FakeOutboxRepository();

  const brand = await createBrand(
    { tenants, brands, outbox, now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      name: "La Parrilla",
      config: { language: "es", currency: "ARS" },
    },
  );

  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]!.eventName, "BrandCreated");
  assert.equal(outbox.records[0]!.aggregateId, brand.id);
});
