import { randomUUID } from "node:crypto";
import type { Subscription, BillingCycle } from "../domain/subscription.js";
import { resolvePlan } from "../domain/plan-registry.js";
import type { SubscriptionRepositoryPort } from "./ports.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";

export interface CreateSubscriptionInput {
  tenantId: string;
  subscriberFiscalEntityId?: string;
  planCode: string;
  billingCycle?: BillingCycle;
  id?: string;
}

export interface CreateSubscriptionDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
}

// SPEC-001 §7 — one step of tenant provisioning: a new tenant starts on a
// TRIAL subscription. periodEnd defaults to +30 days regardless of billing
// cycle, since a trial isn't a paid period.
export async function createSubscription(
  deps: CreateSubscriptionDeps,
  input: CreateSubscriptionInput,
): Promise<Subscription> {
  resolvePlan(input.planCode); // throws UnknownPlanError if invalid

  const now = (deps.now ?? (() => new Date()))();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const subscription: Subscription = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    ...(input.subscriberFiscalEntityId
      ? { subscriberFiscalEntityId: input.subscriberFiscalEntityId }
      : {}),
    planCode: input.planCode,
    status: "TRIAL",
    billingCycle: input.billingCycle ?? "MONTHLY",
    startDate: now,
    renewalDate: periodEnd,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    autoRenew: false,
    createdAt: now,
    updatedAt: now,
  };

  await deps.subscriptions.save(subscription);
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);
  return subscription;
}
