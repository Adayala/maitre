import type { Entitlement, EntitlementRepositoryPort } from "@maitre/subscription";

export class InMemoryEntitlementRepository implements EntitlementRepositoryPort {
  private readonly byId = new Map<string, Entitlement>();

  async listBySubscription(subscriptionId: string): Promise<Entitlement[]> {
    return [...this.byId.values()].filter((e) => e.subscriptionId === subscriptionId);
  }

  async save(entitlement: Entitlement): Promise<void> {
    this.byId.set(entitlement.id, entitlement);
  }

  async deleteByResource(subscriptionId: string, resource: string): Promise<void> {
    for (const [id, entitlement] of this.byId) {
      if (entitlement.subscriptionId === subscriptionId && entitlement.resource === resource) {
        this.byId.delete(id);
      }
    }
  }
}
