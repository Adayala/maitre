import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateEntitlements } from "../domain/calculate-entitlements.js";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { CatalogItem } from "../domain/catalog-item.js";
import type { Entitlement } from "../domain/entitlement.js";

const now = new Date("2026-02-01T00:00:00Z");

const seats: CatalogItem = {
  code: "SEATS",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "BRANCH",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: ["FLOOR"],
  isActive: true,
  version: 1,
};

const floor: CatalogItem = {
  code: "FLOOR",
  name: "Piso",
  billingType: "SERVICE",
  billingScope: "BRANCH",
  unitPrice: 0,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: [],
  isActive: true,
  version: 1,
};

function aSeatsItem(overrides: Partial<SubscriptionItem> = {}): SubscriptionItem {
  return {
    id: "item-1",
    subscriptionId: "sub-1",
    serviceId: "SEATS",
    scopeRefId: "branch-palermo",
    status: "ACTIVE",
    quantity: 12,
    unitPrice: 500,
    activatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

test("derives a resource limit from an active QUANTITY item's quantity", () => {
  const result = calculateEntitlements([aSeatsItem()], new Map([["SEATS", seats]]), [], now);
  const entry = result.find((r) => r.resource === "SEATS[branch-palermo]");
  assert.equal(entry?.hardLimit, 12);
});

test("ignores INACTIVE items", () => {
  const result = calculateEntitlements(
    [aSeatsItem({ status: "INACTIVE" })],
    new Map([["SEATS", seats]]),
    [],
    now,
  );
  assert.equal(result.length, 0);
});

test("a SERVICE billing type item contributes no numeric limit", () => {
  const floorItem = aSeatsItem({ serviceId: "FLOOR", scopeRefId: "branch-palermo" });
  const result = calculateEntitlements([floorItem], new Map([["FLOOR", floor]]), [], now);
  assert.equal(result.length, 0);
});

test("an item with no catalog entry is ignored", () => {
  const result = calculateEntitlements([aSeatsItem()], new Map(), [], now);
  assert.equal(result.length, 0);
});

test("distinct scopeRefIds for the same catalog code produce distinct resources", () => {
  const items = [
    aSeatsItem({ id: "item-1", scopeRefId: "branch-palermo", quantity: 12 }),
    aSeatsItem({ id: "item-2", scopeRefId: "branch-belgrano", quantity: 5 }),
  ];
  const result = calculateEntitlements(items, new Map([["SEATS", seats]]), [], now);
  assert.equal(result.find((r) => r.resource === "SEATS[branch-palermo]")?.hardLimit, 12);
  assert.equal(result.find((r) => r.resource === "SEATS[branch-belgrano]")?.hardLimit, 5);
});

test("an active, non-expired tenant override takes precedence over the contracted quantity", () => {
  const overrides: Entitlement[] = [
    {
      id: "e1",
      subscriptionId: "sub-1",
      resource: "SEATS[branch-palermo]",
      hardLimit: 999,
      overrideReason: "custom deal",
    },
  ];
  const result = calculateEntitlements([aSeatsItem()], new Map([["SEATS", seats]]), overrides, now);
  assert.equal(result.find((r) => r.resource === "SEATS[branch-palermo]")?.hardLimit, 999);
});

test("an expired override is ignored", () => {
  const overrides: Entitlement[] = [
    {
      id: "e1",
      subscriptionId: "sub-1",
      resource: "SEATS[branch-palermo]",
      hardLimit: 999,
      overrideReason: "custom deal",
      expiresAt: new Date("2025-01-01T00:00:00Z"),
    },
  ];
  const result = calculateEntitlements([aSeatsItem()], new Map([["SEATS", seats]]), overrides, now);
  assert.equal(result.find((r) => r.resource === "SEATS[branch-palermo]")?.hardLimit, 12);
});

test("an existing softLimit is preserved across recalculation", () => {
  const overrides: Entitlement[] = [
    {
      id: "e1",
      subscriptionId: "sub-1",
      resource: "SEATS[branch-palermo]",
      hardLimit: 12,
      softLimit: 10,
    },
  ];
  const result = calculateEntitlements([aSeatsItem()], new Map([["SEATS", seats]]), overrides, now);
  assert.equal(result.find((r) => r.resource === "SEATS[branch-palermo]")?.softLimit, 10);
});
