import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  canTransitionBrand,
  transitionBrand,
  canCreateBranchUnderBrand,
  canModifyBrandConfig,
  InvalidBrandTransitionError,
  type Brand,
} from "../domain/brand.js";

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "44444444-4444-4444-4444-444444444444",
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

test("slugify normalizes accents, case and spacing", () => {
  assert.equal(slugify("La Parrilla Ñoño"), "la-parrilla-nono");
});

test("slugify trims leading/trailing separators", () => {
  assert.equal(slugify("  --Café con Leche!!  "), "cafe-con-leche");
});

test("allows ACTIVE <-> INACTIVE and both -> ARCHIVED", () => {
  assert.equal(canTransitionBrand("ACTIVE", "INACTIVE"), true);
  assert.equal(canTransitionBrand("INACTIVE", "ACTIVE"), true);
  assert.equal(canTransitionBrand("ACTIVE", "ARCHIVED"), true);
  assert.equal(canTransitionBrand("INACTIVE", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionBrand("ARCHIVED", "ACTIVE"), false);
});

test("transitionBrand sets archivedAt when moving to ARCHIVED", () => {
  const brand = makeBrand();
  const now = new Date("2026-04-01T00:00:00Z");
  const archived = transitionBrand(brand, "ARCHIVED", now);
  assert.equal(archived.status, "ARCHIVED");
  assert.equal(archived.archivedAt, now);
});

test("transitionBrand throws on invalid transition", () => {
  const brand = makeBrand({ status: "ARCHIVED" });
  assert.throws(
    () => transitionBrand(brand, "ACTIVE", new Date()),
    InvalidBrandTransitionError,
  );
});

test("ARCHIVED brand cannot create new branches or modify config", () => {
  const archived = makeBrand({ status: "ARCHIVED" });
  assert.equal(canCreateBranchUnderBrand(archived), false);
  assert.equal(canModifyBrandConfig(archived), false);
});

test("ACTIVE brand can create branches and modify config", () => {
  const active = makeBrand({ status: "ACTIVE" });
  assert.equal(canCreateBranchUnderBrand(active), true);
  assert.equal(canModifyBrandConfig(active), true);
});

test("INACTIVE brand can modify config but not create branches", () => {
  const inactive = makeBrand({ status: "INACTIVE" });
  assert.equal(canCreateBranchUnderBrand(inactive), false);
  assert.equal(canModifyBrandConfig(inactive), true);
});
