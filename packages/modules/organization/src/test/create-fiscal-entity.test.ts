import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createFiscalEntity,
  DuplicateCuitError,
} from "../application/create-fiscal-entity.js";
import { TenantNotOperableError } from "../application/errors.js";
import { InvalidCuitError } from "../domain/fiscal-entity.js";
import { FakeTenantRepository, FakeFiscalEntityRepository, aTenant } from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

test("createFiscalEntity succeeds for an ACTIVE tenant, normalizing the CUIT", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const fiscalEntities = new FakeFiscalEntityRepository();

  const entity = await createFiscalEntity(
    { tenants, fiscalEntities, now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      cuit: "20-12345678-6",
      name: "La Parrilla S.A.",
      taxCondition: "RI",
    },
  );

  assert.equal(entity.cuit, "20123456786");
  assert.equal(entity.status, "ACTIVE");
});

test("createFiscalEntity rejects a non-operable tenant", async () => {
  const tenants = new FakeTenantRepository([aTenant({ status: "ARCHIVED" })]);
  const fiscalEntities = new FakeFiscalEntityRepository();

  await assert.rejects(
    createFiscalEntity(
      { tenants, fiscalEntities, now: () => now },
      {
        tenantId: "11111111-1111-1111-1111-111111111111",
        cuit: "20-12345678-6",
        name: "La Parrilla S.A.",
        taxCondition: "RI",
      },
    ),
    TenantNotOperableError,
  );
});

test("createFiscalEntity rejects an invalid CUIT before touching the repository", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const fiscalEntities = new FakeFiscalEntityRepository();

  await assert.rejects(
    createFiscalEntity(
      { tenants, fiscalEntities, now: () => now },
      {
        tenantId: "11111111-1111-1111-1111-111111111111",
        cuit: "20-12345678-9",
        name: "La Parrilla S.A.",
        taxCondition: "RI",
      },
    ),
    InvalidCuitError,
  );
});

test("createFiscalEntity rejects a duplicate CUIT within the same tenant", async () => {
  const tenants = new FakeTenantRepository([aTenant()]);
  const fiscalEntities = new FakeFiscalEntityRepository();
  await createFiscalEntity(
    { tenants, fiscalEntities, now: () => now },
    {
      tenantId: "11111111-1111-1111-1111-111111111111",
      cuit: "20-12345678-6",
      name: "La Parrilla S.A.",
      taxCondition: "RI",
    },
  );

  await assert.rejects(
    createFiscalEntity(
      { tenants, fiscalEntities, now: () => now },
      {
        tenantId: "11111111-1111-1111-1111-111111111111",
        cuit: "20-12345678-6",
        name: "Otra Razón Social",
        taxCondition: "MONOTRIBUTISTA",
      },
    ),
    DuplicateCuitError,
  );
});
