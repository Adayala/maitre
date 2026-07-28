// SPEC-0XX — SubscriptionCatalogItem: the priced, versioned template for
// what can be contracted (replaces the fixed PLAN_REGISTRY).

export type CatalogBillingType = "SERVICE" | "QUANTITY";
export type CatalogBillingScope =
  | "TENANT"
  | "BRAND"
  | "FISCAL_ENTITY"
  | "BRANCH"
  | "POS"
  | "CONNECTOR";

export interface CatalogItem {
  code: string;
  name: string;
  billingType: CatalogBillingType;
  billingScope: CatalogBillingScope;
  unitPrice: number;
  currency: string;
  period: "MONTHLY";
  dependsOn: string[];
  isActive: boolean;
  version: number;
}

export function requiresScopeRef(item: CatalogItem): boolean {
  return item.billingScope !== "TENANT";
}
