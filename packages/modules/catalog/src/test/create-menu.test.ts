import { test } from "node:test";
import assert from "node:assert/strict";
import { createMenu, DuplicateMenuSlugError } from "../application/create-menu.js";
import { FakeMenuRepository, aMenu } from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");
const tenantId = "22222222-2222-2222-2222-222222222222";
const brandId = "33333333-3333-3333-3333-333333333333";

test("createMenu creates an ACTIVE menu with a derived slug", async () => {
  const menus = new FakeMenuRepository();
  const menu = await createMenu(
    { menus, now: () => now },
    { tenantId, brandId, name: "Main Menu" },
  );
  assert.equal(menu.slug, "main-menu");
  assert.equal(menu.status, "ACTIVE");
});

test("createMenu rejects a duplicate slug within the same brand", async () => {
  const menus = new FakeMenuRepository([aMenu()]);
  await assert.rejects(
    createMenu({ menus, now: () => now }, { tenantId, brandId, name: "Main Menu" }),
    DuplicateMenuSlugError,
  );
});

test("createMenu allows the same slug across different brands", async () => {
  const menus = new FakeMenuRepository([aMenu({ brandId: "other-brand" })]);
  const menu = await createMenu(
    { menus, now: () => now },
    { tenantId, brandId, name: "Main Menu" },
  );
  assert.equal(menu.slug, "main-menu");
});
