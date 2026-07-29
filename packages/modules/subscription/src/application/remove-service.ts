import { randomUUID } from "node:crypto";
import { deactivateSubscriptionItem, type SubscriptionItem } from "../domain/subscription-item.js";
import type { SubscriptionRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { serviceDeactivatedEvent } from "./events.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";

export class ServiceNotFoundError extends Error {
  constructor(serviceId: string, subscriptionId: string) {
    super(`Service ${serviceId} not found on subscription ${subscriptionId}`);
    this.name = "ServiceNotFoundError";
  }
}

export interface RemoveServiceInput {
  subscriptionId: string;
  serviceId: string;
  scopeRefId?: string | null;
  correlationId?: string;
}

export interface RemoveServiceDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  outbox: OutboxPort;
}

// SPEC-031 DELETE /subscriptions/:id/services/:serviceId; emits
// ServiceDeactivated (SPEC-034) and recalculates entitlements.
export async function removeService(
  deps: RemoveServiceDeps,
  input: RemoveServiceInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription) throw new ServiceNotFoundError(input.serviceId, input.subscriptionId);

  const existing = await deps.subscriptionItems.findByServiceId(
    input.subscriptionId,
    input.serviceId,
    input.scopeRefId ?? null,
  );
  if (!existing) throw new ServiceNotFoundError(input.serviceId, input.subscriptionId);

  const now = (deps.now ?? (() => new Date()))();
  const item = deactivateSubscriptionItem(existing, now);
  await deps.subscriptionItems.save(item);
  await deps.outbox.append(
    serviceDeactivatedEvent(item, subscription.tenantId, input.correlationId ?? randomUUID()),
  );
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return item;
}
