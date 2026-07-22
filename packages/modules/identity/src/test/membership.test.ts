import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionMembership,
  assertMembershipInvariants,
  isMembershipActive,
  branchInScope,
  MembershipInvariantError,
  type Membership,
} from "../domain/membership.js";

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "88888888-8888-8888-8888-888888888888",
    tenantId: "11111111-1111-1111-1111-111111111111",
    userId: "77777777-7777-7777-7777-777777777777",
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("allows INVITED -> ACTIVE/REVOKED, ACTIVE <-> SUSPENDED, both -> REVOKED", () => {
  assert.equal(canTransitionMembership("INVITED", "ACTIVE"), true);
  assert.equal(canTransitionMembership("INVITED", "REVOKED"), true);
  assert.equal(canTransitionMembership("ACTIVE", "SUSPENDED"), true);
  assert.equal(canTransitionMembership("SUSPENDED", "ACTIVE"), true);
  assert.equal(canTransitionMembership("ACTIVE", "REVOKED"), true);
  assert.equal(canTransitionMembership("SUSPENDED", "REVOKED"), true);
});

test("REVOKED is terminal", () => {
  assert.equal(canTransitionMembership("REVOKED", "ACTIVE"), false);
});

test("INVITED cannot go directly to SUSPENDED", () => {
  assert.equal(canTransitionMembership("INVITED", "SUSPENDED"), false);
});

test("ACTIVE membership requires at least one role", () => {
  const membership = makeMembership({ roleIds: [] });
  assert.throws(() => assertMembershipInvariants(membership), MembershipInvariantError);
});

test("membership with an unknown role id invalidates the change (SPEC-020 §Roles)", () => {
  const membership = makeMembership({ roleIds: ["role_does_not_exist"] });
  assert.throws(() => assertMembershipInvariants(membership));
});

test("SELECTED_BRANCHES requires at least one branch id", () => {
  const membership = makeMembership({
    branchScopeType: "SELECTED_BRANCHES",
    branchIds: [],
  });
  assert.throws(() => assertMembershipInvariants(membership), MembershipInvariantError);
});

test("valid ACTIVE/ALL_BRANCHES membership passes invariants", () => {
  assert.doesNotThrow(() => assertMembershipInvariants(makeMembership()));
});

test("valid ACTIVE/SELECTED_BRANCHES membership with a branch passes invariants", () => {
  assert.doesNotThrow(() =>
    assertMembershipInvariants(
      makeMembership({
        branchScopeType: "SELECTED_BRANCHES",
        branchIds: ["22222222-2222-2222-2222-222222222222"],
      }),
    ),
  );
});

test("isMembershipActive reflects status", () => {
  assert.equal(isMembershipActive(makeMembership({ status: "ACTIVE" })), true);
  assert.equal(isMembershipActive(makeMembership({ status: "SUSPENDED" })), false);
});

test("branchInScope: ALL_BRANCHES always in scope", () => {
  const membership = makeMembership({ branchScopeType: "ALL_BRANCHES" });
  assert.equal(branchInScope(membership, "any-branch-id"), true);
});

test("branchInScope: SELECTED_BRANCHES only matches listed branches", () => {
  const membership = makeMembership({
    branchScopeType: "SELECTED_BRANCHES",
    branchIds: ["branch-a"],
  });
  assert.equal(branchInScope(membership, "branch-a"), true);
  assert.equal(branchInScope(membership, "branch-b"), false);
});
