import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import { upgradePlan, SubscriptionNotFoundError } from "../application/upgrade-plan.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
  FakeCatalogRepository,
} from "./fakes.js";
import type { CatalogItem } from "../domain/catalog-item.js";

const now = new Date("2026-05-01T00:00:00Z");

const seats: CatalogItem = {
  code: "SEATS",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "BRANCH",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: [],
  isActive: true,
  version: 1,
};

test("upgradePlan changes planCode; entitlements stay driven by contracted quantities, not the new plan", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository([seats]);
  const deps = { subscriptions, subscriptionItems, entitlements, catalog, now: () => now };

  const subscription = await createSubscription(deps, {
    tenantId: "tenant-1",
    planCode: "STARTER",
  });

  await subscriptionItems.save({
    id: "item-1",
    subscriptionId: subscription.id,
    serviceId: "SEATS",
    scopeRefId: "branch-palermo",
    status: "ACTIVE",
    quantity: 12,
    unitPrice: 500,
    activatedAt: now,
  });

  const upgraded = await upgradePlan(deps, {
    subscriptionId: subscription.id,
    planCode: "PROFESSIONAL",
  });

  assert.equal(upgraded.planCode, "PROFESSIONAL");
  const seatsEntitlement = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "SEATS[branch-palermo]",
  );
  assert.equal(seatsEntitlement?.hardLimit, 12);
});

test("upgradePlan rejects an unknown subscriptionId", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository();

  await assert.rejects(
    upgradePlan(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { subscriptionId: "does-not-exist", planCode: "PROFESSIONAL" },
    ),
    SubscriptionNotFoundError,
  );
});
