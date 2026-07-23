import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import { upgradePlan, SubscriptionNotFoundError } from "../application/upgrade-plan.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
} from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

test("upgradePlan changes planCode and recalculates entitlements", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const deps = { subscriptions, subscriptionItems, entitlements, now: () => now };

  const subscription = await createSubscription(deps, {
    tenantId: "tenant-1",
    planCode: "STARTER",
  });

  const upgraded = await upgradePlan(deps, {
    subscriptionId: subscription.id,
    planCode: "PROFESSIONAL",
  });

  assert.equal(upgraded.planCode, "PROFESSIONAL");
  const branches = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "branches",
  );
  assert.equal(branches?.hardLimit, 5);
});

test("upgradePlan rejects an unknown subscriptionId", async () => {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();

  await assert.rejects(
    upgradePlan(
      { subscriptions, subscriptionItems, entitlements, now: () => now },
      { subscriptionId: "does-not-exist", planCode: "PROFESSIONAL" },
    ),
    SubscriptionNotFoundError,
  );
});
