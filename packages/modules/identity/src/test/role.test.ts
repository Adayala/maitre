import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRoles, UnknownRoleError, ROLE_REGISTRY } from "../domain/role.js";

test("resolveRoles resolves known role ids", () => {
  const roles = resolveRoles(["role_owner", "role_admin"]);
  assert.equal(roles.length, 2);
  assert.equal(roles[0]!.id, "role_owner");
  assert.equal(roles[1]!.id, "role_admin");
});

test("resolveRoles throws on an unknown role id", () => {
  assert.throws(() => resolveRoles(["role_owner", "role_does_not_exist"]), UnknownRoleError);
});

test("resolveRoles on an empty list returns an empty array", () => {
  assert.deepEqual(resolveRoles([]), []);
});

test("role_owner has the wildcard permission", () => {
  assert.deepEqual(ROLE_REGISTRY["role_owner"]!.permissions, ["*"]);
});

test("role_employee has no organization permissions (SPEC-016: EMPLOYEE cannot manage organization)", () => {
  const perms = ROLE_REGISTRY["role_employee"]!.permissions;
  assert.equal(perms.includes("organization:read"), false);
  assert.equal(perms.includes("organization:write"), false);
});
