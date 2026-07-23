// SPEC-030 — Quota domain model (current usage against an Entitlement).

export interface Quota {
  id: string;
  subscriptionId: string;
  resource: string;
  used: number;
  entitlementId: string;
  lastUpdatedAt: Date;
}

export function incrementQuota(quota: Quota, by: number, now: Date): Quota {
  return { ...quota, used: quota.used + by, lastUpdatedAt: now };
}

export function decrementQuota(quota: Quota, by: number, now: Date): Quota {
  return { ...quota, used: Math.max(0, quota.used - by), lastUpdatedAt: now };
}
