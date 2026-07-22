import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionTenant,
  transitionTenant,
  isTenantOperable,
  InvalidTenantTransitionError,
  type Tenant,
} from "../domain/tenant.js";

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Acme",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("ACTIVE tenant is operable", () => {
  assert.equal(isTenantOperable(makeTenant({ status: "ACTIVE" })), true);
});

test("SUSPENDED and ARCHIVED tenants are not operable", () => {
  assert.equal(isTenantOperable(makeTenant({ status: "SUSPENDED" })), false);
  assert.equal(isTenantOperable(makeTenant({ status: "ARCHIVED" })), false);
});

test("allows ACTIVE <-> SUSPENDED", () => {
  assert.equal(canTransitionTenant("ACTIVE", "SUSPENDED"), true);
  assert.equal(canTransitionTenant("SUSPENDED", "ACTIVE"), true);
});

test("allows ACTIVE/SUSPENDED -> ARCHIVED", () => {
  assert.equal(canTransitionTenant("ACTIVE", "ARCHIVED"), true);
  assert.equal(canTransitionTenant("SUSPENDED", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionTenant("ARCHIVED", "ACTIVE"), false);
  assert.equal(canTransitionTenant("ARCHIVED", "SUSPENDED"), false);
});

test("transitionTenant applies a valid transition and bumps updatedAt", () => {
  const tenant = makeTenant();
  const now = new Date("2026-02-01T00:00:00Z");
  const updated = transitionTenant(tenant, "SUSPENDED", now);
  assert.equal(updated.status, "SUSPENDED");
  assert.equal(updated.updatedAt, now);
});

test("transitionTenant throws on an invalid transition", () => {
  const tenant = makeTenant({ status: "ARCHIVED" });
  assert.throws(
    () => transitionTenant(tenant, "ACTIVE", new Date()),
    InvalidTenantTransitionError,
  );
});
