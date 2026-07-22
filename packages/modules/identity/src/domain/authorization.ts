import { resolveRoles } from "./role.js";
import { matchesPermission } from "./permission.js";

// SPEC-026 §Enforcement / SPEC-016 §Enforcement — a role grants zero or more
// permission ids; hasPermission checks the requested id against every
// granted id across every resolved role (union, no precedence).
export function hasPermission(roleIds: string[], requiredPermissionId: string): boolean {
  const roles = resolveRoles(roleIds);
  return roles.some((role) =>
    role.permissions.some((granted) => matchesPermission(granted, requiredPermissionId)),
  );
}
