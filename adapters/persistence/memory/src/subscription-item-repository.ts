import type { SubscriptionItem, SubscriptionItemRepositoryPort } from "@maitre/subscription";

export class InMemorySubscriptionItemRepository implements SubscriptionItemRepositoryPort {
  private readonly byId = new Map<string, SubscriptionItem>();

  async listBySubscription(subscriptionId: string): Promise<SubscriptionItem[]> {
    return [...this.byId.values()].filter((i) => i.subscriptionId === subscriptionId);
  }

  async findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId: string | null = null,
  ): Promise<SubscriptionItem | null> {
    for (const i of this.byId.values()) {
      if (
        i.subscriptionId === subscriptionId &&
        i.serviceId === serviceId &&
        (i.scopeRefId ?? null) === scopeRefId
      ) {
        return i;
      }
    }
    return null;
  }

  async save(item: SubscriptionItem): Promise<void> {
    this.byId.set(item.id, item);
  }
}
