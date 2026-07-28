import { randomUUID } from "node:crypto";
import { activateSubscriptionItem, type SubscriptionItem } from "../domain/subscription-item.js";
import { isSubscriptionOperable } from "../domain/subscription.js";
import type {
  SubscriptionRepositoryPort,
  SubscriptionItemRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { serviceActivatedEvent } from "./events.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";

export class SubscriptionNotOperableError extends Error {
  constructor(subscriptionId: string) {
    super(`Subscription ${subscriptionId} does not exist or is not operable`);
    this.name = "SubscriptionNotOperableError";
  }
}

export interface AddServiceInput {
  subscriptionId: string;
  serviceId: string;
  scopeRefId?: string;
  quantity?: number;
  unitPrice?: number;
  correlationId?: string;
}

export interface AddServiceDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  outbox: OutboxPort;
}

// SPEC-031 POST /subscriptions/:id/services; emits ServiceActivated
// (SPEC-033) and recalculates entitlements (SPEC-035).
export async function addService(
  deps: AddServiceDeps,
  input: AddServiceInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription || !isSubscriptionOperable(subscription)) {
    throw new SubscriptionNotOperableError(input.subscriptionId);
  }

  const now = (deps.now ?? (() => new Date()))();
  const catalogItem = await deps.catalog.findByCode(input.serviceId);
  const existing = await deps.subscriptionItems.findByServiceId(
    input.subscriptionId,
    input.serviceId,
    input.scopeRefId ?? null,
  );

  const item: SubscriptionItem = existing
    ? activateSubscriptionItem(existing, now)
    : {
        id: randomUUID(),
        subscriptionId: input.subscriptionId,
        serviceId: input.serviceId,
        catalogItemCode: input.serviceId,
        scopeRefId: input.scopeRefId ?? null,
        status: "ACTIVE",
        quantity: input.quantity ?? 1,
        unitPrice: input.unitPrice ?? catalogItem?.unitPrice ?? 0,
        activatedAt: now,
      };

  await deps.subscriptionItems.save(item);
  await deps.outbox.append(
    serviceActivatedEvent(item, subscription.tenantId, input.correlationId ?? randomUUID()),
  );
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return item;
}
