import type { Subscription } from "../domain/subscription.js";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { Entitlement } from "../domain/entitlement.js";
import type { Quota } from "../domain/quota.js";
import type { CatalogItem } from "../domain/catalog-item.js";
import type { CatalogPackage } from "../domain/catalog-package.js";

export interface SubscriptionRepositoryPort {
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  findById(id: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<void>;
}

export interface SubscriptionItemRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<SubscriptionItem[]>;
  findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId?: string | null,
  ): Promise<SubscriptionItem | null>;
  save(item: SubscriptionItem): Promise<void>;
}

export interface EntitlementRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<Entitlement[]>;
  save(entitlement: Entitlement): Promise<void>;
  deleteByResource(subscriptionId: string, resource: string): Promise<void>;
}

export interface QuotaRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<Quota[]>;
  findByResource(subscriptionId: string, resource: string): Promise<Quota | null>;
  save(quota: Quota): Promise<void>;
}

export interface CatalogRepositoryPort {
  listActive(): Promise<CatalogItem[]>;
  findByCode(code: string): Promise<CatalogItem | null>;
}

export interface CatalogPackageRepositoryPort {
  listActive(): Promise<CatalogPackage[]>;
  findByCode(code: string): Promise<CatalogPackage | null>;
  save(catalogPackage: CatalogPackage): Promise<void>;
}
