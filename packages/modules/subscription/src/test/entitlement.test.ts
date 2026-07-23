import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isOverrideActive,
  isWithinHardLimit,
  isAboveSoftLimit,
  type Entitlement,
} from "../domain/entitlement.js";

function anEntitlement(overrides: Partial<Entitlement> = {}): Entitlement {
  return {
    id: "1",
    subscriptionId: "sub-1",
    resource: "branches",
    hardLimit: 5,
    ...overrides,
  };
}

test("isOverrideActive is false without an overrideReason", () => {
  assert.equal(isOverrideActive(anEntitlement(), new Date()), false);
});

test("isOverrideActive is true with a reason and no expiry", () => {
  assert.equal(
    isOverrideActive(anEntitlement({ overrideReason: "goodwill" }), new Date()),
    true,
  );
});

test("isOverrideActive respects expiresAt", () => {
  const entitlement = anEntitlement({
    overrideReason: "temp",
    expiresAt: new Date("2026-01-01T00:00:00Z"),
  });
  assert.equal(isOverrideActive(entitlement, new Date("2025-12-01T00:00:00Z")), true);
  assert.equal(isOverrideActive(entitlement, new Date("2026-02-01T00:00:00Z")), false);
});

test("isWithinHardLimit", () => {
  const entitlement = anEntitlement({ hardLimit: 3 });
  assert.equal(isWithinHardLimit(entitlement, 2), true);
  assert.equal(isWithinHardLimit(entitlement, 3), false);
});

test("isAboveSoftLimit is false when no softLimit is set", () => {
  assert.equal(isAboveSoftLimit(anEntitlement(), 100), false);
});

test("isAboveSoftLimit compares used against softLimit", () => {
  const entitlement = anEntitlement({ softLimit: 2 });
  assert.equal(isAboveSoftLimit(entitlement, 1), false);
  assert.equal(isAboveSoftLimit(entitlement, 2), true);
});
