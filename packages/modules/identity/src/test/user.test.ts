import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionUser,
  isUserEligibleForSession,
  externalIdentityKey,
  type User,
} from "../domain/user.js";

function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "77777777-7777-7777-7777-777777777777",
    identityProvider: "fixture",
    externalIdentityId: "demo-owner",
    displayName: "Demo Owner",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("ACTIVE user is eligible for session, SUSPENDED/DEACTIVATED are not", () => {
  assert.equal(isUserEligibleForSession(makeUser({ status: "ACTIVE" })), true);
  assert.equal(isUserEligibleForSession(makeUser({ status: "SUSPENDED" })), false);
  assert.equal(isUserEligibleForSession(makeUser({ status: "DEACTIVATED" })), false);
});

test("allows ACTIVE <-> SUSPENDED and both -> DEACTIVATED", () => {
  assert.equal(canTransitionUser("ACTIVE", "SUSPENDED"), true);
  assert.equal(canTransitionUser("SUSPENDED", "ACTIVE"), true);
  assert.equal(canTransitionUser("ACTIVE", "DEACTIVATED"), true);
  assert.equal(canTransitionUser("SUSPENDED", "DEACTIVATED"), true);
});

test("DEACTIVATED is terminal (no reactivation in I0)", () => {
  assert.equal(canTransitionUser("DEACTIVATED", "ACTIVE"), false);
  assert.equal(canTransitionUser("DEACTIVATED", "SUSPENDED"), false);
});

test("externalIdentityKey composes a stable provider:subject key", () => {
  assert.equal(externalIdentityKey("fixture", "demo-owner"), "fixture:demo-owner");
});
