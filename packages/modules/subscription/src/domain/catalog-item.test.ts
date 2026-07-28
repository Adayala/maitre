import { describe, it, expect } from "vitest";
import { requiresScopeRef, type CatalogItem } from "./catalog-item.js";

const baseItem: CatalogItem = {
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

describe("requiresScopeRef", () => {
  it("returns true when billing scope is not TENANT", () => {
    expect(requiresScopeRef(baseItem)).toBe(true);
  });

  it("returns false when billing scope is TENANT", () => {
    expect(requiresScopeRef({ ...baseItem, billingScope: "TENANT" })).toBe(false);
  });
});
