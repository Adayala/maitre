// SPEC-027 — Subscription domain model.

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
export type BillingCycle = "MONTHLY" | "ANNUALLY";

export interface Subscription {
  id: string;
  tenantId: string;
  /** Fiscal owner represented by this subscription; null only for legacy records awaiting explicit migration. */
  subscriberFiscalEntityId?: string;
  planCode: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: Date;
  renewalDate: Date;
  cancellationDate?: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIAL: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["SUSPENDED", "CANCELLED"],
  SUSPENDED: ["ACTIVE", "CANCELLED"],
  CANCELLED: [],
};

export class InvalidSubscriptionTransitionError extends Error {
  constructor(from: SubscriptionStatus, to: SubscriptionStatus) {
    super(`Subscription cannot transition from ${from} to ${to}`);
    this.name = "InvalidSubscriptionTransitionError";
  }
}

export function canTransitionSubscription(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionSubscription(
  subscription: Subscription,
  to: SubscriptionStatus,
  now: Date,
): Subscription {
  if (!canTransitionSubscription(subscription.status, to)) {
    throw new InvalidSubscriptionTransitionError(subscription.status, to);
  }
  return {
    ...subscription,
    status: to,
    updatedAt: now,
    cancellationDate: to === "CANCELLED" ? now : (subscription.cancellationDate ?? null),
  };
}

export function isSubscriptionOperable(subscription: Subscription): boolean {
  return subscription.status === "TRIAL" || subscription.status === "ACTIVE";
}
