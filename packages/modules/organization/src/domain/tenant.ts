// SPEC-001 — Tenant domain model and invariants.
// Domain layer: no external dependencies (SPEC-209 §Dirección de dependencias).

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  defaultLocale: string;
  defaultCurrency: string;
  defaultTimezone: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const allowedTransitions: Record<TenantStatus, TenantStatus[]> = {
  ACTIVE: ["SUSPENDED", "ARCHIVED"],
  SUSPENDED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidTenantTransitionError extends Error {
  constructor(from: TenantStatus, to: TenantStatus) {
    super(`Tenant cannot transition from ${from} to ${to}`);
    this.name = "InvalidTenantTransitionError";
  }
}

export function canTransitionTenant(from: TenantStatus, to: TenantStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionTenant(tenant: Tenant, to: TenantStatus, now: Date): Tenant {
  if (!canTransitionTenant(tenant.status, to)) {
    throw new InvalidTenantTransitionError(tenant.status, to);
  }
  return { ...tenant, status: to, updatedAt: now };
}

export function isTenantOperable(tenant: Tenant): boolean {
  return tenant.status === "ACTIVE";
}
