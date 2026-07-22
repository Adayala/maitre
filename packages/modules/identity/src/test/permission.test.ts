import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePermissionId, matchesPermission } from "../domain/permission.js";

test("parsePermissionId parses resource:action", () => {
  assert.deepEqual(parsePermissionId("user:read"), { resource: "user", action: "read" });
});

test("parsePermissionId parses the bare wildcard", () => {
  assert.deepEqual(parsePermissionId("*"), { resource: "*", action: "*" });
});

test("parsePermissionId rejects malformed ids", () => {
  assert.throws(() => parsePermissionId("user"));
  assert.throws(() => parsePermissionId("user:"));
});

test("matchesPermission: bare wildcard grants anything", () => {
  assert.equal(matchesPermission("*", "user:read"), true);
  assert.equal(matchesPermission("*", "branch:create"), true);
});

test("matchesPermission: resource:* grants every action on that resource", () => {
  assert.equal(matchesPermission("user:*", "user:read"), true);
  assert.equal(matchesPermission("user:*", "user:write"), true);
  assert.equal(matchesPermission("user:*", "branch:read"), false);
});

test("matchesPermission: exact resource:action match", () => {
  assert.equal(matchesPermission("user:read", "user:read"), true);
});

test("matchesPermission: different resource or action does not match", () => {
  assert.equal(matchesPermission("user:read", "user:write"), false);
  assert.equal(matchesPermission("user:read", "branch:read"), false);
});
