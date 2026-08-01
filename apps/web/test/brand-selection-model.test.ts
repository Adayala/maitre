import assert from "node:assert/strict";
import test from "node:test";
import {
  brandSelectionStorageKey,
  resolveSelectedBrandId,
} from "../src/app/brand-selection-model.js";

test("brand selection is persisted in a tenant-scoped key", () => {
  assert.equal(
    brandSelectionStorageKey("tenant-a"),
    "maitre.selectedBrandId.tenant-a",
  );
});

test("selected brand must remain available within the active tenant", () => {
  assert.equal(
    resolveSelectedBrandId("brand-a", ["brand-a", "brand-b"]),
    "brand-a",
  );
  assert.equal(resolveSelectedBrandId("foreign", ["brand-a"]), null);
  assert.equal(resolveSelectedBrandId(null, ["brand-a"]), null);
});
