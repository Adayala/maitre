import { randomUUID } from "node:crypto";
import { calculateEntitlements } from "../domain/calculate-entitlements.js";
import type { Entitlement } from "../domain/entitlement.js";
import type {
  EntitlementRepositoryPort,
  SubscriptionItemRepositoryPort,
} from "./ports.js";

export interface RecalculateEntitlementsDeps {
  subscriptionItems: SubscriptionItemRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  now?: () => Date;
}

// SPEC-035 §4 — "Persist to entitlements table". Recomputes every resource
// from plan + active services + existing (still-active) overrides, then
// upserts one Entitlement row per resource.
export async function recalculateEntitlements(
  deps: RecalculateEntitlementsDeps,
  subscriptionId: string,
  planCode: string,
): Promise<Entitlement[]> {
  const now = (deps.now ?? (() => new Date()))();
  const items = await deps.subscriptionItems.listBySubscription(subscriptionId);
  const activeServiceIds = items.filter((i) => i.status === "ACTIVE").map((i) => i.serviceId);
  const existing = await deps.entitlements.listBySubscription(subscriptionId);

  const calculated = calculateEntitlements(planCode, activeServiceIds, existing, now);
  const existingByResource = new Map(existing.map((e) => [e.resource, e] as const));

  const result: Entitlement[] = [];
  for (const calc of calculated) {
    const prior = existingByResource.get(calc.resource);
    const entitlement: Entitlement = {
      id: prior?.id ?? randomUUID(),
      subscriptionId,
      resource: calc.resource,
      hardLimit: calc.hardLimit,
      ...(calc.softLimit != null ? { softLimit: calc.softLimit } : {}),
      ...(prior?.overrideReason ? { overrideReason: prior.overrideReason } : {}),
      ...(prior?.expiresAt ? { expiresAt: prior.expiresAt } : {}),
    };
    await deps.entitlements.save(entitlement);
    result.push(entitlement);
  }
  return result;
}
