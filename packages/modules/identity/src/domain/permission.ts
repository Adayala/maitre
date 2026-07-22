// SPEC-019 — Permission Entity: resource:action pairs, with wildcard support
// used by SPEC-016/026's role matrices ("*" grants everything, "resource:*"
// grants every action on that resource).

export interface Permission {
  resource: string;
  action: string;
}

export const WILDCARD = "*";

export function parsePermissionId(id: string): Permission {
  if (id === WILDCARD) return { resource: WILDCARD, action: WILDCARD };
  const [resource, action] = id.split(":");
  if (!resource || !action) {
    throw new Error(`Invalid permission id "${id}", expected "resource:action"`);
  }
  return { resource, action };
}

/** Does a granted permission id satisfy a requested permission id? */
export function matchesPermission(grantedId: string, requestedId: string): boolean {
  if (grantedId === WILDCARD) return true;
  const granted = parsePermissionId(grantedId);
  const requested = parsePermissionId(requestedId);
  if (granted.resource !== requested.resource) return false;
  return granted.action === WILDCARD || granted.action === requested.action;
}
