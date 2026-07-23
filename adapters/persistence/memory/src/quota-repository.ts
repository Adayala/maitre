import type { Quota, QuotaRepositoryPort } from "@maitre/subscription";

export class InMemoryQuotaRepository implements QuotaRepositoryPort {
  private readonly byId = new Map<string, Quota>();

  async listBySubscription(subscriptionId: string): Promise<Quota[]> {
    return [...this.byId.values()].filter((q) => q.subscriptionId === subscriptionId);
  }

  async findByResource(subscriptionId: string, resource: string): Promise<Quota | null> {
    for (const q of this.byId.values()) {
      if (q.subscriptionId === subscriptionId && q.resource === resource) return q;
    }
    return null;
  }

  async save(quota: Quota): Promise<void> {
    this.byId.set(quota.id, quota);
  }
}
