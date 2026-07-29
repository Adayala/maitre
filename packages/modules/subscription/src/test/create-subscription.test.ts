import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import { UnknownPlanError } from "../domain/plan-registry.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
  FakeCatalogRepository,
} from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

test("createSubscription creates a TRIAL subscription with no entitlements when no services are contracted", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository();

  const subscription = await createSubscription(
    { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
    { tenantId: "tenant-1", planCode: "STARTER" },
  );

  assert.equal(subscription.status, "TRIAL");
  assert.equal(subscription.planCode, "STARTER");

  const savedEntitlements = await entitlements.listBySubscription(subscription.id);
  assert.equal(savedEntitlements.length, 0);
});

test("createSubscription rejects an unknown plan code", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository();

  await assert.rejects(
    createSubscription(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { tenantId: "tenant-1", planCode: "BOGUS" },
    ),
    UnknownPlanError,
  );
});
