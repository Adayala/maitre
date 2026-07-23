import { resolvePlan } from "../domain/plan-registry.js";
import type { Subscription } from "../domain/subscription.js";
import type { SubscriptionRepositoryPort } from "./ports.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";

export class SubscriptionNotFoundError extends Error {
  constructor(id: string) {
    super(`Subscription ${id} not found`);
    this.name = "SubscriptionNotFoundError";
  }
}

export interface UpgradePlanInput {
  subscriptionId: string;
  planCode: string;
  billingCycle?: Subscription["billingCycle"];
}

export interface UpgradePlanDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
}

// SPEC-031 POST /subscriptions/upgrade; recalculates entitlements under
// the new plan (SPEC-035).
export async function upgradePlan(
  deps: UpgradePlanDeps,
  input: UpgradePlanInput,
): Promise<Subscription> {
  resolvePlan(input.planCode);
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription) throw new SubscriptionNotFoundError(input.subscriptionId);

  const now = (deps.now ?? (() => new Date()))();
  const updated: Subscription = {
    ...subscription,
    planCode: input.planCode,
    ...(input.billingCycle ? { billingCycle: input.billingCycle } : {}),
    updatedAt: now,
  };
  await deps.subscriptions.save(updated);
  await recalculateEntitlements(deps, updated.id, updated.planCode);
  return updated;
}
