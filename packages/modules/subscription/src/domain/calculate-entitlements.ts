import type { Entitlement } from "./entitlement.js";
import type { SubscriptionItem } from "./subscription-item.js";
import type { CatalogItem } from "./catalog-item.js";
import { isOverrideActive } from "./entitlement.js";

export interface CalculatedEntitlement {
  resource: string;
  hardLimit: number;
  softLimit?: number;
}

// Replaces the PLAN_REGISTRY-based calculation (plan.limits + fixed
// per-service overrides) with one derived directly from the contracted
// subscription_items: a SERVICE item grants boolean capability (no numeric
// limit of its own here), while a QUANTITY item contributes a hard limit
// equal to its contracted quantity, keyed as "<CODE>[<scopeRefId>]" so the
// same catalog code doesn't collide across different scopes (e.g. branches).
export function calculateEntitlements(
  activeItems: SubscriptionItem[],
  catalogByCode: Map<string, CatalogItem>,
  existingEntitlements: Entitlement[],
  now: Date,
): CalculatedEntitlement[] {
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
  for (const item of activeItems) {
    if (item.status !== "ACTIVE") continue;
    const code = item.catalogItemCode ?? item.serviceId;
    const catalogItem = catalogByCode.get(code);
    if (!catalogItem || catalogItem.billingType !== "QUANTITY") continue;

    const resource = item.scopeRefId ? `${code}[${item.scopeRefId}]` : code;
    const override = overrideByResource.get(resource);
    const hardLimit = override ? override.hardLimit : item.quantity;
    const softLimit = softLimitByResource.get(resource);
    result.push({ resource, hardLimit, ...(softLimit != null ? { softLimit } : {}) });
  }
  return result;
}
