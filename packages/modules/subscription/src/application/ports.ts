import type { Subscription } from "../domain/subscription.js";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { Entitlement } from "../domain/entitlement.js";
import type { Quota } from "../domain/quota.js";

export interface SubscriptionRepositoryPort {
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  findById(id: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<void>;
}

export interface SubscriptionItemRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<SubscriptionItem[]>;
  findByServiceId(subscriptionId: string, serviceId: string): Promise<SubscriptionItem | null>;
  save(item: SubscriptionItem): Promise<void>;
}

export interface EntitlementRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<Entitlement[]>;
  save(entitlement: Entitlement): Promise<void>;
}

export interface QuotaRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<Quota[]>;
  findByResource(subscriptionId: string, resource: string): Promise<Quota | null>;
  save(quota: Quota): Promise<void>;
}
