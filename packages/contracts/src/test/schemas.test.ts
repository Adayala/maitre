import { test } from "node:test";
import assert from "node:assert/strict";
import { tenantSchema } from "../tenant.js";
import { branchSchema } from "../branch.js";
import { brandSchema } from "../brand.js";
import { fiscalEntitySchema } from "../fiscal-entity.js";
import { membershipSchema } from "../membership.js";

const now = new Date("2026-01-01T00:00:00Z").toISOString();

test("tenantSchema accepts a valid tenant", () => {
  const result = tenantSchema.safeParse({
    id: "11111111-1111-1111-1111-111111111111",
    name: "Acme",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, true);
});

test("tenantSchema rejects an empty name", () => {
  const result = tenantSchema.safeParse({
    id: "11111111-1111-1111-1111-111111111111",
    name: "",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("tenantSchema rejects an invalid status enum value", () => {
  const result = tenantSchema.safeParse({
    id: "11111111-1111-1111-1111-111111111111",
    name: "Acme",
    status: "TRIALING",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("branchSchema rejects a code with lowercase or invalid characters", () => {
  const result = branchSchema.safeParse({
    id: "22222222-2222-2222-2222-222222222222",
    tenantId: "11111111-1111-1111-1111-111111111111",
    brandId: "33333333-3333-3333-3333-333333333333",
    code: "main!",
    name: "Main",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("branchSchema accepts a valid normalized code", () => {
  const result = branchSchema.safeParse({
    id: "22222222-2222-2222-2222-222222222222",
    tenantId: "11111111-1111-1111-1111-111111111111",
    brandId: "33333333-3333-3333-3333-333333333333",
    code: "MAIN-1",
    name: "Main",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, true);
});

test("brandSchema rejects name shorter than 3 characters", () => {
  const result = brandSchema.safeParse({
    id: "44444444-4444-4444-4444-444444444444",
    tenantId: "11111111-1111-1111-1111-111111111111",
    name: "AB",
    slug: "ab",
    status: "ACTIVE",
    config: { language: "es", currency: "ARS" },
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("fiscalEntitySchema rejects a CUIT that is not 11 digits", () => {
  const result = fiscalEntitySchema.safeParse({
    id: "55555555-5555-5555-5555-555555555555",
    tenantId: "11111111-1111-1111-1111-111111111111",
    cuit: "123",
    name: "La Parrilla S.A.",
    status: "ACTIVE",
    taxCondition: "RI",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("fiscalEntitySchema accepts optional legal/fiscal address and activity code", () => {
  const result = fiscalEntitySchema.safeParse({
    id: "55555555-5555-5555-5555-555555555555",
    tenantId: "11111111-1111-1111-1111-111111111111",
    cuit: "20123456786",
    name: "La Parrilla S.A.",
    legalAddress: "Av. Siempre Viva 123",
    fiscalAddress: "Av. Siempre Viva 123, Piso 2",
    activityCode: "561011",
    status: "ACTIVE",
    taxCondition: "RI",
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, true);
});

test("membershipSchema rejects ACTIVE status with no roles", () => {
  const result = membershipSchema.safeParse({
    id: "88888888-8888-8888-8888-888888888888",
    tenantId: "11111111-1111-1111-1111-111111111111",
    userId: "77777777-7777-7777-7777-777777777777",
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: [],
    branchIds: [],
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("membershipSchema rejects SELECTED_BRANCHES with no branch ids", () => {
  const result = membershipSchema.safeParse({
    id: "88888888-8888-8888-8888-888888888888",
    tenantId: "11111111-1111-1111-1111-111111111111",
    userId: "77777777-7777-7777-7777-777777777777",
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, false);
});

test("membershipSchema accepts a valid ACTIVE/SELECTED_BRANCHES membership", () => {
  const result = membershipSchema.safeParse({
    id: "88888888-8888-8888-8888-888888888888",
    tenantId: "11111111-1111-1111-1111-111111111111",
    userId: "77777777-7777-7777-7777-777777777777",
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: ["22222222-2222-2222-2222-222222222222"],
    createdAt: now,
    updatedAt: now,
  });
  assert.equal(result.success, true);
});
