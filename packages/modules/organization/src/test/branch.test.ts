import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBranchCode,
  canTransitionBranch,
  transitionBranch,
  isBranchOperable,
  InvalidBranchCodeError,
  InvalidBranchTransitionError,
  type Branch,
} from "../domain/branch.js";

function makeBranch(overrides: Partial<Branch> = {}): Branch {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "22222222-2222-2222-2222-222222222222",
    tenantId: "11111111-1111-1111-1111-111111111111",
    brandId: "33333333-3333-3333-3333-333333333333",
    code: "MAIN",
    name: "Main Branch",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("normalizeBranchCode uppercases and trims", () => {
  assert.equal(normalizeBranchCode(" main "), "MAIN");
});

test("normalizeBranchCode accepts allowed characters", () => {
  assert.equal(normalizeBranchCode("a1_b-2"), "A1_B-2");
});

test("normalizeBranchCode rejects codes over 32 chars", () => {
  const tooLong = "A".repeat(33);
  assert.throws(() => normalizeBranchCode(tooLong), InvalidBranchCodeError);
});

test("normalizeBranchCode rejects codes starting with disallowed char", () => {
  assert.throws(() => normalizeBranchCode("-MAIN"), InvalidBranchCodeError);
});

test("ACTIVE branch is operable, INACTIVE/ARCHIVED are not", () => {
  assert.equal(isBranchOperable(makeBranch({ status: "ACTIVE" })), true);
  assert.equal(isBranchOperable(makeBranch({ status: "INACTIVE" })), false);
  assert.equal(isBranchOperable(makeBranch({ status: "ARCHIVED" })), false);
});

test("allows ACTIVE <-> INACTIVE and both -> ARCHIVED", () => {
  assert.equal(canTransitionBranch("ACTIVE", "INACTIVE"), true);
  assert.equal(canTransitionBranch("INACTIVE", "ACTIVE"), true);
  assert.equal(canTransitionBranch("ACTIVE", "ARCHIVED"), true);
  assert.equal(canTransitionBranch("INACTIVE", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionBranch("ARCHIVED", "ACTIVE"), false);
});

test("transitionBranch throws on invalid transition", () => {
  const branch = makeBranch({ status: "ARCHIVED" });
  assert.throws(
    () => transitionBranch(branch, "ACTIVE", new Date()),
    InvalidBranchTransitionError,
  );
});

test("transitionBranch applies a valid transition", () => {
  const branch = makeBranch();
  const now = new Date("2026-03-01T00:00:00Z");
  const updated = transitionBranch(branch, "INACTIVE", now);
  assert.equal(updated.status, "INACTIVE");
  assert.equal(updated.updatedAt, now);
});
