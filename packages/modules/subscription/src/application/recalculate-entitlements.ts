import { randomUUID } from "node:crypto";
import { calculateEntitlements } from "../domain/calculate-entitlements.js";
import type { Entitlement } from "../domain/entitlement.js";
import type {
  CatalogRepositoryPort,
  EntitlementRepositoryPort,
  SubscriptionItemRepositoryPort,
} from "./ports.js";

export interface RecalculateEntitlementsDeps {
  subscriptionItems: SubscriptionItemRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  catalog: CatalogRepositoryPort;
  now?: () => Date;
}

// SPEC-035 §4 — "Persist to entitlements table". Recomputes every resource
// from the contracted subscription_items (each QUANTITY item contributing a
// limit via its CatalogItem) + existing (still-active) overrides, then
// upserts one Entitlement row per resource. `planCode` is accepted for
// call-site compatibility but no longer drives limits — the plan is now an
// informational label on the Subscription only.
export async function recalculateEntitlements(
  deps: RecalculateEntitlementsDeps,
  subscriptionId: string,
  planCode: string,
): Promise<Entitlement[]> {
  const now = (deps.now ?? (() => new Date()))();
  const items = await deps.subscriptionItems.listBySubscription(subscriptionId);
  const existing = await deps.entitlements.listBySubscription(subscriptionId);
  const catalogItems = await deps.catalog.listActive();
  const catalogByCode = new Map(catalogItems.map((c) => [c.code, c] as const));

  const calculated = calculateEntitlements(items, catalogByCode, existing, now);
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
