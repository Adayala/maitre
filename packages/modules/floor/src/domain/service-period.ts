// SPEC-054 — ServicePeriod domain model (canonical name per spec-054's own
// text: distinct from Subscription's "Service").
//
// SCOPE NOTE (approved simplification): no ServicePeriodPolicyVersion
// entity — the one hard rule enforced is fixed and hardcoded: at most one
// OPEN or CLOSING ServicePeriod per branch at a time. businessDate is a
// plain ISO date string derived from `now`/branch timezone via
// Intl.DateTimeFormat — no real DST edge-case handling (deferred).

export type ServicePeriodType = "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
export type ServicePeriodStatus = "PLANNED" | "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";

export interface ServicePeriod {
  id: string;
  tenantId: string;
  branchId: string;
  businessDate: string; // ISO date (YYYY-MM-DD)
  name: string;
  type: ServicePeriodType;
  plannedOpen?: Date;
  plannedClose?: Date;
  actualOpen?: Date | null;
  actualClose?: Date | null;
  status: ServicePeriodStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<ServicePeriodStatus, ServicePeriodStatus[]> = {
  PLANNED: ["OPEN", "CANCELLED"],
  OPEN: ["CLOSING"],
  CLOSING: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export class InvalidServicePeriodTransitionError extends Error {
  constructor(from: ServicePeriodStatus, to: ServicePeriodStatus) {
    super(`ServicePeriod cannot transition from ${from} to ${to}`);
    this.name = "InvalidServicePeriodTransitionError";
  }
}

export function assertServicePeriodTransition(
  from: ServicePeriodStatus,
  to: ServicePeriodStatus,
): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidServicePeriodTransitionError(from, to);
  }
}

export class ConflictingServicePeriodError extends Error {
  constructor(branchId: string) {
    super(`Branch ${branchId} already has an OPEN or CLOSING ServicePeriod`);
    this.name = "ConflictingServicePeriodError";
  }
}

export function isActiveServicePeriod(period: ServicePeriod): boolean {
  return period.status === "OPEN" || period.status === "CLOSING";
}

/**
 * Business date derivation: plain YYYY-MM-DD in the branch's IANA
 * timezone via Intl. No DST edge-case handling — a documented deferred
 * gap (see module header note above and README.md).
 */
export function deriveBusinessDate(now: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // en-CA formats as YYYY-MM-DD
}
