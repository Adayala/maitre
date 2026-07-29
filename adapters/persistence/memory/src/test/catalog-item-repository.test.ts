import { test } from "node:test";
import assert from "node:assert/strict";
import type { CatalogItem } from "@maitre/subscription";
import { InMemoryCatalogItemRepository } from "../catalog-item-repository.js";

const item: CatalogItem = {
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

test("InMemoryCatalogItemRepository - lists only active items", async () => {
  const repo = new InMemoryCatalogItemRepository([
    item,
    { ...item, code: "OLD", isActive: false },
  ]);
  const active = await repo.listActive();
  assert.deepEqual(
    active.map((i) => i.code),
    ["SEATS"]
  );
});

test("InMemoryCatalogItemRepository - finds by code", async () => {
  const repo = new InMemoryCatalogItemRepository([item]);
  assert.deepEqual(await repo.findByCode("SEATS"), item);
  assert.deepEqual(await repo.findByCode("MISSING"), null);
});
