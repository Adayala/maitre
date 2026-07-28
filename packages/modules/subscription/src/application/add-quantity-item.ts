import { randomUUID } from "node:crypto";
import { activateSubscriptionItem, type SubscriptionItem } from "../domain/subscription-item.js";
import { requiresScopeRef } from "../domain/catalog-item.js";
import { isSubscriptionOperable } from "../domain/subscription.js";
import type {
  SubscriptionRepositoryPort,
  SubscriptionItemRepositoryPort,
  CatalogRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { serviceActivatedEvent } from "./events.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";
import { SubscriptionNotOperableError } from "./add-service.js";

export class CatalogItemNotFoundError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" not found or inactive`);
    this.name = "CatalogItemNotFoundError";
  }
}

export class MissingScopeRefError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" requires a scopeRefId`);
    this.name = "MissingScopeRefError";
  }
}

export class InvalidQuantityForServiceError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" requires a positive quantity`);
    this.name = "InvalidQuantityForServiceError";
  }
}

export interface AddQuantityItemInput {
  subscriptionId: string;
  catalogItemCode: string;
  quantity: number;
  scopeRefId?: string;
  correlationId?: string;
}

export interface AddQuantityItemDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  catalog: CatalogRepositoryPort;
  outbox: OutboxPort;
}

// SPEC-0XX — creates or reactivates a QUANTITY-billed subscription item
// scoped by the catalog item's billingScope, then recalculates entitlements
// (SPEC-035).
export async function addQuantityItem(
  deps: AddQuantityItemDeps,
  input: AddQuantityItemInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription || !isSubscriptionOperable(subscription)) {
    throw new SubscriptionNotOperableError(input.subscriptionId);
  }

  const catalogItem = await deps.catalog.findByCode(input.catalogItemCode);
  if (!catalogItem || !catalogItem.isActive) {
    throw new CatalogItemNotFoundError(input.catalogItemCode);
  }
  if (requiresScopeRef(catalogItem) && !input.scopeRefId) {
    throw new MissingScopeRefError(input.catalogItemCode);
  }
  if (!Number.isInteger(input.quantity) || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new InvalidQuantityForServiceError(input.catalogItemCode);
  }

  const now = (deps.now ?? (() => new Date()))();
  const scopeRefId = input.scopeRefId ?? null;
  const existing = await deps.subscriptionItems.findByServiceId(
    input.subscriptionId,
    input.catalogItemCode,
    scopeRefId,
  );

  const item: SubscriptionItem = existing
    ? activateSubscriptionItem({ ...existing, quantity: input.quantity }, now)
    : {
        id: randomUUID(),
        subscriptionId: input.subscriptionId,
        serviceId: input.catalogItemCode,
        scopeRefId,
        status: "ACTIVE",
        quantity: input.quantity,
        unitPrice: catalogItem.unitPrice,
        activatedAt: now,
      };

  await deps.subscriptionItems.save(item);
  await deps.outbox.append(
    serviceActivatedEvent(item, subscription.tenantId, input.correlationId ?? randomUUID()),
  );
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return item;
}
