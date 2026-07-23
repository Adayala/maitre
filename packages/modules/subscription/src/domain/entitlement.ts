// SPEC-029 — Entitlement domain model.

export type EntitlementResource = "branches" | "users" | "orders" | "api_calls" | "storage";

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
