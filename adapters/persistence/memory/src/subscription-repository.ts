import type { Subscription, SubscriptionRepositoryPort } from "@maitre/subscription";

export class InMemorySubscriptionRepository implements SubscriptionRepositoryPort {
  private readonly byId = new Map<string, Subscription>();

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    for (const s of this.byId.values()) {
      if (s.tenantId === tenantId) return s;
    }
    return null;
  }

  async findById(id: string): Promise<Subscription | null> {
    return this.byId.get(id) ?? null;
  }

  async save(subscription: Subscription): Promise<void> {
    this.byId.set(subscription.id, subscription);
  }
}
