import { test } from "node:test";
import assert from "node:assert/strict";
import { createCategory, UnknownMenuError } from "../application/create-category.js";
import { createProduct, UnknownCategoryError } from "../application/create-product.js";
import { InvalidPriceError } from "../domain/product.js";
import { FakeMenuRepository, FakeCategoryRepository, FakeProductRepository, aMenu, aCategory } from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");
const tenantId = "22222222-2222-2222-2222-222222222222";

test("createCategory succeeds for an existing menu and inherits its brandId", async () => {
  const menus = new FakeMenuRepository([aMenu()]);
  const categories = new FakeCategoryRepository();
  const category = await createCategory(
    { menus, categories, now: () => now },
    { tenantId, menuId: "11111111-1111-1111-1111-111111111111", name: "Starters" },
  );
  assert.equal(category.brandId, "33333333-3333-3333-3333-333333333333");
  assert.equal(category.slug, "starters");
});

test("createCategory rejects an unknown menuId", async () => {
  const menus = new FakeMenuRepository([]);
  const categories = new FakeCategoryRepository();
  await assert.rejects(
    createCategory(
      { menus, categories, now: () => now },
      { tenantId, menuId: "does-not-exist", name: "Starters" },
    ),
    UnknownMenuError,
  );
});

test("createProduct succeeds for an existing category", async () => {
  const categories = new FakeCategoryRepository([aCategory()]);
  const products = new FakeProductRepository();
  const product = await createProduct(
    { categories, products, now: () => now },
    {
      tenantId,
      categoryId: "44444444-4444-4444-4444-444444444444",
      name: "Milanesa",
      priceMinorUnits: 500000,
      currency: "ARS",
    },
  );
  assert.equal(product.status, "AVAILABLE");
  assert.equal(product.slug, "milanesa");
});

test("createProduct rejects an unknown categoryId", async () => {
  const categories = new FakeCategoryRepository([]);
  const products = new FakeProductRepository();
  await assert.rejects(
    createProduct(
      { categories, products, now: () => now },
      { tenantId, categoryId: "does-not-exist", name: "Milanesa", priceMinorUnits: 1, currency: "ARS" },
    ),
    UnknownCategoryError,
  );
});

test("createProduct rejects an invalid price", async () => {
  const categories = new FakeCategoryRepository([aCategory()]);
  const products = new FakeProductRepository();
  await assert.rejects(
    createProduct(
      { categories, products, now: () => now },
      {
        tenantId,
        categoryId: "44444444-4444-4444-4444-444444444444",
        name: "Milanesa",
        priceMinorUnits: -5,
        currency: "ARS",
      },
    ),
    InvalidPriceError,
  );
});
