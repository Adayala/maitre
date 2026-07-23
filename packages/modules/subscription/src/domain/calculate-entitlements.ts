import type { EntitlementResource, Entitlement } from "./entitlement.js";
import { resolvePlan } from "./plan-registry.js";
import { isOverrideActive } from "./entitlement.js";

// SPEC-035 — no formal service catalog spec exists yet; these overrides are
// illustrative placeholders matching SPEC-035's own example ("floor" ->
// branches>=10, "kitchen" -> orders unlimited). Revisit once a real Service
// entity/spec exists.
const SERVICE_OVERRIDES: Record<string, Partial<Record<EntitlementResource, number>>> = {
  floor: { branches: 10 },
  kitchen: { orders: Number.MAX_SAFE_INTEGER },
};

export interface CalculatedEntitlement {
  resource: EntitlementResource;
  hardLimit: number;
  softLimit?: number;
}

/**
 * SPEC-035 §Algoritmo — plan defaults, then service overrides (max), then
 * active tenant overrides (highest precedence). Pure function; persisting
 * the result to the entitlements table is the caller's job.
 */
export function calculateEntitlements(
  planCode: string,
  activeServiceIds: string[],
  existingEntitlements: Entitlement[],
  now: Date,
): CalculatedEntitlement[] {
  const plan = resolvePlan(planCode);
  const limits = new Map<EntitlementResource, number>(
    Object.entries(plan.limits) as [EntitlementResource, number][],
  );

  for (const serviceId of activeServiceIds) {
    const overrides = SERVICE_OVERRIDES[serviceId];
    if (!overrides) continue;
    for (const [resource, value] of Object.entries(overrides) as [
      EntitlementResource,
      number,
    ][]) {
      const current = limits.get(resource) ?? 0;
      limits.set(resource, Math.max(current, value));
    }
  }

  const overrideByResource = new Map(
    existingEntitlements
      .filter((e) => isOverrideActive(e, now))
      .map((e) => [e.resource, e] as const),
  );

  const softLimitByResource = new Map(
    existingEntitlements
      .filter((e) => e.softLimit != null)
      .map((e) => [e.resource, e.softLimit!] as const),
  );

  const result: CalculatedEntitlement[] = [];
  for (const [resource, hardLimit] of limits) {
    const override = overrideByResource.get(resource);
    const finalHardLimit = override ? override.hardLimit : hardLimit;
    const softLimit = softLimitByResource.get(resource);
    result.push({
      resource,
      hardLimit: finalHardLimit,
      ...(softLimit != null ? { softLimit } : {}),
    });
  }
  return result;
}
