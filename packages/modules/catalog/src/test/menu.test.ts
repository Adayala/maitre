import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  canTransitionMenu,
  transitionMenu,
  InvalidMenuTransitionError,
} from "../domain/menu.js";
import { aMenu } from "./fakes.js";

test("slugify normalizes accents, case and spacing", () => {
  assert.equal(slugify("Menú Principal"), "menu-principal");
});

test("allows ACTIVE <-> INACTIVE and both -> ARCHIVED", () => {
  assert.equal(canTransitionMenu("ACTIVE", "INACTIVE"), true);
  assert.equal(canTransitionMenu("INACTIVE", "ACTIVE"), true);
  assert.equal(canTransitionMenu("ACTIVE", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionMenu("ARCHIVED", "ACTIVE"), false);
});

test("transitionMenu throws on an invalid transition", () => {
  const menu = aMenu({ status: "ARCHIVED" });
  assert.throws(() => transitionMenu(menu, "ACTIVE", new Date()), InvalidMenuTransitionError);
});

test("transitionMenu applies a valid transition", () => {
  const menu = aMenu();
  const now = new Date("2026-02-01T00:00:00Z");
  const updated = transitionMenu(menu, "INACTIVE", now);
  assert.equal(updated.status, "INACTIVE");
  assert.equal(updated.updatedAt, now);
});
