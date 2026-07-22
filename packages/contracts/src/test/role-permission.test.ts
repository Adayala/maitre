import { test } from "node:test";
import assert from "node:assert/strict";
import { roleSchema } from "../role.js";
import { permissionSchema, permissionIdSchema } from "../permission.js";

test("roleSchema accepts a valid role", () => {
  const result = roleSchema.safeParse({
    id: "role_owner",
    name: "Owner",
    description: "Full control",
    permissions: ["*"],
  });
  assert.equal(result.success, true);
});

test("permissionIdSchema accepts the bare wildcard and resource:action forms", () => {
  assert.equal(permissionIdSchema.safeParse("*").success, true);
  assert.equal(permissionIdSchema.safeParse("user:read").success, true);
  assert.equal(permissionIdSchema.safeParse("user:*").success, true);
});

test("permissionIdSchema rejects malformed ids", () => {
  assert.equal(permissionIdSchema.safeParse("user").success, false);
  assert.equal(permissionIdSchema.safeParse("User:Read").success, false);
});

test("permissionSchema accepts a valid permission", () => {
  const result = permissionSchema.safeParse({
    id: "user:read",
    name: "Read user",
    description: "Read a user record",
    resource: "user",
    action: "read",
  });
  assert.equal(result.success, true);
});
