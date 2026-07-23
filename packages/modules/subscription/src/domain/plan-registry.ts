import type { EntitlementResource } from "./entitlement.js";

// Plans are predefined (no Plan entity/spec exists in the catalog — SPEC-007
// mentions plan_tier STARTER/PROFESSIONAL/ENTERPRISE as an enum, and SPEC-035
// references "plan.max_branches" etc. as defaults). Mirrors the ROLE_REGISTRY
// pattern: a fixed catalog, not a database table, for I0.

export interface PlanDefaults {
  code: string;
  name: string;
  limits: Partial<Record<EntitlementResource, number>>;
}

export const PLAN_REGISTRY: Readonly<Record<string, PlanDefaults>> = Object.freeze({
  STARTER: {
    code: "STARTER",
    name: "Starter",
    limits: { branches: 1, users: 5, orders: 500, api_calls: 1000, storage: 1 },
  },
  PROFESSIONAL: {
    code: "PROFESSIONAL",
    name: "Professional",
    limits: { branches: 5, users: 25, orders: 5000, api_calls: 10000, storage: 10 },
  },
  ENTERPRISE: {
    code: "ENTERPRISE",
    name: "Enterprise",
    limits: {
      branches: Number.MAX_SAFE_INTEGER,
      users: Number.MAX_SAFE_INTEGER,
      orders: Number.MAX_SAFE_INTEGER,
      api_calls: Number.MAX_SAFE_INTEGER,
      storage: Number.MAX_SAFE_INTEGER,
    },
  },
});

export class UnknownPlanError extends Error {
  constructor(code: string) {
    super(`Unknown plan "${code}"`);
    this.name = "UnknownPlanError";
  }
}

export function resolvePlan(code: string): PlanDefaults {
  const plan = PLAN_REGISTRY[code];
  if (!plan) throw new UnknownPlanError(code);
  return plan;
}
