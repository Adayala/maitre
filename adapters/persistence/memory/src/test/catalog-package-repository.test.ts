import test from "node:test";
import assert from "node:assert/strict";
import type { CatalogPackage } from "@maitre/subscription";
import { InMemoryCatalogPackageRepository } from "../catalog-package-repository.js";

const base: CatalogPackage = {
  code: "BASE",
  name: "Base",
  tagline: "Para comenzar",
  description: "Configuración mínima",
  benefits: ["Menor inversión"],
  items: [{ catalogItemCode: "CORE" }],
  isActive: true,
  sortOrder: 20,
  version: 1,
};

test("catalog packages list only active records ordered by sortOrder", async () => {
  const repository = new InMemoryCatalogPackageRepository([
    base,
    { ...base, code: "FIRST", sortOrder: 10 },
    { ...base, code: "OLD", isActive: false, sortOrder: 1 },
  ]);

  assert.deepEqual(
    (await repository.listActive()).map((catalogPackage) => catalogPackage.code),
    ["FIRST", "BASE"],
  );
  assert.equal((await repository.findByCode("BASE"))?.name, "Base");
});
