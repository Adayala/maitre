import { test } from "node:test";
import assert from "node:assert/strict";
import { requiresScopeRef, type CatalogItem } from "../domain/catalog-item.js";

function aBaseCatalogItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
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
    ...overrides,
  };
}

test("requiresScopeRef returns true when billing scope is not TENANT", () => {
  const item = aBaseCatalogItem();
  assert.equal(requiresScopeRef(item), true);
});

test("requiresScopeRef returns false when billing scope is TENANT", () => {
  const item = aBaseCatalogItem({ billingScope: "TENANT" });
  assert.equal(requiresScopeRef(item), false);
});
