import { test } from "node:test";
import assert from "node:assert/strict";
import { tenantCreatedEvent, brandCreatedEvent, branchCreatedEvent } from "../application/events.js";
import { aTenant, aBranch } from "./fakes.js";
import type { Brand } from "../domain/brand.js";

const now = new Date("2026-05-01T00:00:00Z");
const correlationId = "99999999-9999-9999-9999-999999999999";

function aBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: "33333333-3333-3333-3333-333333333333",
    tenantId: "11111111-1111-1111-1111-111111111111",
    name: "La Parrilla",
    slug: "la-parrilla",
    status: "ACTIVE",
    config: { language: "es", currency: "ARS" },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("tenantCreatedEvent has the SPEC-013 envelope shape and minimal payload", () => {
  const tenant = aTenant();
  const event = tenantCreatedEvent(tenant, correlationId);

  assert.equal(event.eventName, "TenantCreated");
  assert.equal(event.eventVersion, 1);
  assert.equal(event.aggregateType, "Tenant");
  assert.equal(event.aggregateId, tenant.id);
  assert.equal(event.tenantId, tenant.id);
  assert.equal(event.correlationId, correlationId);
  assert.equal(event.status, "PENDING");
  assert.deepEqual(event.payload, {
    tenantId: tenant.id,
    name: tenant.name,
    status: tenant.status,
    createdAt: tenant.createdAt,
  });
});

test("tenantCreatedEvent payload excludes contact info and other non-minimal fields", () => {
  const tenant = aTenant({ contactEmail: "owner@demo.maitre", contactPhone: "+5491100000000" });
  const event = tenantCreatedEvent(tenant, correlationId);
  assert.equal("contactEmail" in event.payload, false);
  assert.equal("contactPhone" in event.payload, false);
});

test("brandCreatedEvent has the SPEC-014 envelope shape and minimal payload", () => {
  const brand = aBrand();
  const event = brandCreatedEvent(brand, correlationId);

  assert.equal(event.eventName, "BrandCreated");
  assert.equal(event.aggregateType, "Brand");
  assert.equal(event.tenantId, brand.tenantId);
  assert.deepEqual(event.payload, {
    brandId: brand.id,
    tenantId: brand.tenantId,
    name: brand.name,
    status: brand.status,
    createdAt: brand.createdAt,
  });
});

test("brandCreatedEvent payload excludes config, logo and website", () => {
  const brand = aBrand({ logoUrl: "https://example.com/logo.png", website: "https://example.com" });
  const event = brandCreatedEvent(brand, correlationId);
  assert.equal("config" in event.payload, false);
  assert.equal("logoUrl" in event.payload, false);
  assert.equal("website" in event.payload, false);
});

test("branchCreatedEvent has the SPEC-015 envelope shape and minimal payload", () => {
  const branch = aBranch();
  const event = branchCreatedEvent(branch, correlationId);

  assert.equal(event.eventName, "BranchCreated");
  assert.equal(event.aggregateType, "Branch");
  assert.equal(event.tenantId, branch.tenantId);
  assert.deepEqual(event.payload, {
    branchId: branch.id,
    tenantId: branch.tenantId,
    brandId: branch.brandId,
    name: branch.name,
    timezone: branch.timezone,
    status: branch.status,
    createdAt: branch.createdAt,
  });
});

test("branchCreatedEvent payload excludes address and phone", () => {
  const branch = aBranch({
    contactEmail: "branch@demo.maitre",
    contactPhone: "+5491100000000",
  });
  const event = branchCreatedEvent(branch, correlationId);
  assert.equal("contactEmail" in event.payload, false);
  assert.equal("contactPhone" in event.payload, false);
  assert.equal("address" in event.payload, false);
});

test("branchCreatedEvent includes fiscalEntityId only when present", () => {
  const withFiscal = branchCreatedEvent(
    aBranch({ fiscalEntityId: "44444444-4444-4444-4444-444444444444" }),
    correlationId,
  );
  assert.equal(withFiscal.payload.fiscalEntityId, "44444444-4444-4444-4444-444444444444");

  const withoutFiscal = branchCreatedEvent(aBranch(), correlationId);
  assert.equal("fiscalEntityId" in withoutFiscal.payload, false);
});
