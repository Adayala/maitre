// SPEC-028 — SubscriptionItem domain model (a "service" added to a subscription).

export type SubscriptionItemStatus = "ACTIVE" | "INACTIVE";

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  serviceId: string;
  status: SubscriptionItemStatus;
  quantity: number;
  unitPrice: number;
  activatedAt: Date;
  deactivatedAt?: Date | null;
}

export function activateSubscriptionItem(item: SubscriptionItem, now: Date): SubscriptionItem {
  return { ...item, status: "ACTIVE", activatedAt: now, deactivatedAt: null };
}

export function deactivateSubscriptionItem(
  item: SubscriptionItem,
  now: Date,
): SubscriptionItem {
  return { ...item, status: "INACTIVE", deactivatedAt: now };
}
