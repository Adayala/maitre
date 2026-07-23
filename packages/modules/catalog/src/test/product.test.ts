import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertValidPrice,
  canTransitionProduct,
  transitionProduct,
  InvalidPriceError,
  InvalidProductTransitionError,
  type Product,
} from "../domain/product.js";

function aProduct(overrides: Partial<Product> = {}): Product {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "1",
    tenantId: "tenant-1",
    categoryId: "cat-1",
    name: "Milanesa",
    slug: "milanesa",
    priceMinorUnits: 500000,
    currency: "ARS",
    status: "AVAILABLE",
    allergens: [],
    displayOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("assertValidPrice accepts a non-negative integer", () => {
  assert.doesNotThrow(() => assertValidPrice(0));
  assert.doesNotThrow(() => assertValidPrice(500000));
});

test("assertValidPrice rejects negative and non-integer prices", () => {
  assert.throws(() => assertValidPrice(-1), InvalidPriceError);
  assert.throws(() => assertValidPrice(10.5), InvalidPriceError);
});

test("allows AVAILABLE <-> UNAVAILABLE and both -> ARCHIVED", () => {
  assert.equal(canTransitionProduct("AVAILABLE", "UNAVAILABLE"), true);
  assert.equal(canTransitionProduct("UNAVAILABLE", "AVAILABLE"), true);
  assert.equal(canTransitionProduct("AVAILABLE", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionProduct("ARCHIVED", "AVAILABLE"), false);
});

test("transitionProduct throws on invalid transition", () => {
  assert.throws(
    () => transitionProduct(aProduct({ status: "ARCHIVED" }), "AVAILABLE", new Date()),
    InvalidProductTransitionError,
  );
});
