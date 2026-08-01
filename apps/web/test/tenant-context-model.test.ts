import assert from "node:assert/strict";
import test from "node:test";
import { resolveSelectedTenantId } from "../src/app/tenant-context-model.js";

test("resolveSelectedTenantId requires an explicit valid tenant", () => {
  const tenants = [{ id: "tenant-a" }, { id: "tenant-b" }];
  assert.equal(resolveSelectedTenantId("tenant-b", tenants), "tenant-b");
  assert.equal(resolveSelectedTenantId("missing", tenants), null);
  assert.equal(resolveSelectedTenantId(null, tenants), null);
  assert.equal(resolveSelectedTenantId("tenant-a", undefined), null);
});
