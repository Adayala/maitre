import { type SubscriptionItem } from "../domain/subscription-item.js";
import { isSubscriptionOperable } from "../domain/subscription.js";
import type { SubscriptionRepositoryPort, SubscriptionItemRepositoryPort } from "./ports.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";
import { SubscriptionNotOperableError } from "./add-service.js";
import { InvalidQuantityForServiceError } from "./add-quantity-item.js";

export class SubscriptionItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Subscription item "${itemId}" not found`);
    this.name = "SubscriptionItemNotFoundError";
  }
}

export interface UpdateQuantityInput {
  subscriptionId: string;
  itemId: string;
  quantity: number;
}

export interface UpdateQuantityDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
}

// SPEC-0XX — updates the quantity of an existing subscription item and
// recalculates entitlements (SPEC-035).
export async function updateQuantity(
  deps: UpdateQuantityDeps,
  input: UpdateQuantityInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription || !isSubscriptionOperable(subscription)) {
    throw new SubscriptionNotOperableError(input.subscriptionId);
  }
  if (!Number.isInteger(input.quantity) || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new InvalidQuantityForServiceError(input.itemId);
  }

  const existing = (await deps.subscriptionItems.listBySubscription(input.subscriptionId)).find(
    (i) => i.id === input.itemId,
  );
  if (!existing) throw new SubscriptionItemNotFoundError(input.itemId);
  const catalogItem = await deps.catalog.findByCode(existing.catalogItemCode ?? existing.serviceId);
  if (!catalogItem || catalogItem.billingType !== "QUANTITY") {
    throw new InvalidQuantityForServiceError(existing.serviceId);
  }

  const updated: SubscriptionItem = { ...existing, quantity: input.quantity };
  await deps.subscriptionItems.save(updated);
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return updated;
}
