// SPEC-029 — Entitlement domain model.

// Kept for backward-compat imports; resources are now dynamic strings
// derived from the catalog (e.g. "SEATS[branch-palermo]"), not a fixed union.
export type EntitlementResource = string;

export interface Entitlement {
  id: string;
  subscriptionId: string;
  resource: EntitlementResource;
  softLimit?: number | null;
  hardLimit: number;
  overrideReason?: string | null;
  expiresAt?: Date | null;
}

export function isOverrideActive(entitlement: Entitlement, now: Date): boolean {
  if (!entitlement.overrideReason) return false;
  if (!entitlement.expiresAt) return true;
  return entitlement.expiresAt.getTime() > now.getTime();
}

export function isWithinHardLimit(entitlement: Entitlement, used: number): boolean {
  return used < entitlement.hardLimit;
}

export function isAboveSoftLimit(entitlement: Entitlement, used: number): boolean {
  return entitlement.softLimit != null && used >= entitlement.softLimit;
}
