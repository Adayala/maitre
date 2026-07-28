import type { Subscription } from "../domain/subscription.js";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { Entitlement } from "../domain/entitlement.js";
import type { CatalogItem } from "../domain/catalog-item.js";
import type {
  SubscriptionRepositoryPort,
  SubscriptionItemRepositoryPort,
  EntitlementRepositoryPort,
  CatalogRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeSubscriptionRepository implements SubscriptionRepositoryPort {
  private readonly items: Subscription[] = [];
  async findByTenantId(tenantId: string) {
    return this.items.find((s) => s.tenantId === tenantId) ?? null;
  }
  async findById(id: string) {
    return this.items.find((s) => s.id === id) ?? null;
  }
  async save(subscription: Subscription) {
    const i = this.items.findIndex((s) => s.id === subscription.id);
    if (i >= 0) this.items[i] = subscription;
    else this.items.push(subscription);
  }
}

export class FakeSubscriptionItemRepository implements SubscriptionItemRepositoryPort {
  private readonly items: SubscriptionItem[] = [];
  async listBySubscription(subscriptionId: string) {
    return this.items.filter((i) => i.subscriptionId === subscriptionId);
  }
  async findByServiceId(subscriptionId: string, serviceId: string) {
    return (
      this.items.find(
        (i) => i.subscriptionId === subscriptionId && i.serviceId === serviceId,
      ) ?? null
    );
  }
  async save(item: SubscriptionItem) {
    const i = this.items.findIndex((x) => x.id === item.id);
    if (i >= 0) this.items[i] = item;
    else this.items.push(item);
  }
}

export class FakeEntitlementRepository implements EntitlementRepositoryPort {
  private readonly items: Entitlement[] = [];
  async listBySubscription(subscriptionId: string) {
    return this.items.filter((e) => e.subscriptionId === subscriptionId);
  }
  async save(entitlement: Entitlement) {
    const i = this.items.findIndex((e) => e.id === entitlement.id);
    if (i >= 0) this.items[i] = entitlement;
    else this.items.push(entitlement);
  }
}

export class FakeCatalogRepository implements CatalogRepositoryPort {
  constructor(private readonly items: CatalogItem[] = []) {}
  async listActive() {
    return this.items.filter((i) => i.isActive);
  }
  async findByCode(code: string) {
    return this.items.find((i) => i.code === code) ?? null;
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
