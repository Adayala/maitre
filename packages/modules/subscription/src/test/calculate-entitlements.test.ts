import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateEntitlements } from "../domain/calculate-entitlements.js";
import { UnknownPlanError } from "../domain/plan-registry.js";
import type { Entitlement } from "../domain/entitlement.js";

const now = new Date("2026-01-01T00:00:00Z");

test("STARTER plan yields its default limits with no services or overrides", () => {
  const result = calculateEntitlements("STARTER", [], [], now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.hardLimit, 1);
});

test("an active 'floor' service raises the branches limit to at least 10", () => {
  const result = calculateEntitlements("STARTER", ["floor"], [], now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.hardLimit, 10);
});

test("service overrides never lower a resource below the plan default", () => {
  const result = calculateEntitlements("PROFESSIONAL", ["floor"], [], now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.hardLimit, 10); // PROFESSIONAL default is 5, floor raises to 10
});

test("an active, non-expired tenant override takes precedence over plan+service", () => {
  const overrides: Entitlement[] = [
    {
      id: "e1",
      subscriptionId: "sub-1",
      resource: "branches",
      hardLimit: 999,
      overrideReason: "custom deal",
    },
  ];
  const result = calculateEntitlements("STARTER", [], overrides, now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.hardLimit, 999);
});

test("an expired override is ignored", () => {
  const overrides: Entitlement[] = [
    {
      id: "e1",
      subscriptionId: "sub-1",
      resource: "branches",
      hardLimit: 999,
      overrideReason: "custom deal",
      expiresAt: new Date("2025-01-01T00:00:00Z"),
    },
  ];
  const result = calculateEntitlements("STARTER", [], overrides, now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.hardLimit, 1);
});

test("an existing softLimit is preserved across recalculation", () => {
  const overrides: Entitlement[] = [
    { id: "e1", subscriptionId: "sub-1", resource: "branches", hardLimit: 1, softLimit: 1 },
  ];
  const result = calculateEntitlements("STARTER", [], overrides, now);
  const branches = result.find((r) => r.resource === "branches");
  assert.equal(branches?.softLimit, 1);
});

test("calculateEntitlements throws for an unknown plan code", () => {
  assert.throws(() => calculateEntitlements("BOGUS", [], [], now), UnknownPlanError);
});
