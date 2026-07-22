import { test } from "node:test";
import assert from "node:assert/strict";
import { hasPermission } from "../domain/authorization.js";
import { UnknownRoleError } from "../domain/role.js";

// SPEC-016 §Enforcement matrix
test("OWNER can create tenant, brand and branch", () => {
  assert.equal(hasPermission(["role_owner"], "tenant:create"), true);
  assert.equal(hasPermission(["role_owner"], "brand:create"), true);
  assert.equal(hasPermission(["role_owner"], "branch:create"), true);
});

test("ADMIN can create brand/branch but not tenant", () => {
  assert.equal(hasPermission(["role_admin"], "brand:create"), true);
  assert.equal(hasPermission(["role_admin"], "branch:create"), true);
  assert.equal(hasPermission(["role_admin"], "tenant:create"), false);
});

test("MANAGER can view organization but not create/edit", () => {
  assert.equal(hasPermission(["role_manager"], "organization:read"), true);
  assert.equal(hasPermission(["role_manager"], "organization:write"), false);
  assert.equal(hasPermission(["role_manager"], "brand:create"), false);
});

test("EMPLOYEE cannot manage organization at all", () => {
  assert.equal(hasPermission(["role_employee"], "organization:read"), false);
  assert.equal(hasPermission(["role_employee"], "brand:create"), false);
});

// SPEC-026 §Permission Matrix (Identity resources)
test("OWNER/ADMIN/MANAGER/EMPLOYEE can all read user/role/permission", () => {
  for (const role of ["role_owner", "role_admin", "role_manager", "role_employee"]) {
    assert.equal(hasPermission([role], "user:read"), true, role);
    assert.equal(hasPermission([role], "role:read"), true, role);
    assert.equal(hasPermission([role], "permission:read"), true, role);
  }
});

test("only OWNER/ADMIN can create/write users", () => {
  assert.equal(hasPermission(["role_owner"], "user:create"), true);
  assert.equal(hasPermission(["role_admin"], "user:create"), true);
  assert.equal(hasPermission(["role_manager"], "user:create"), false);
  assert.equal(hasPermission(["role_employee"], "user:create"), false);
});

test("a user with multiple roles gets the union of permissions", () => {
  assert.equal(hasPermission(["role_employee", "role_manager"], "organization:read"), true);
});

test("hasPermission throws when any role id is unknown (fails closed)", () => {
  assert.throws(() => hasPermission(["role_owner", "bogus"], "user:read"), UnknownRoleError);
});
