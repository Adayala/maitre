import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionSubscription,
  transitionSubscription,
  isSubscriptionOperable,
  InvalidSubscriptionTransitionError,
  type Subscription,
} from "../domain/subscription.js";

function aSubscription(overrides: Partial<Subscription> = {}): Subscription {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "11111111-1111-1111-1111-111111111111",
    tenantId: "22222222-2222-2222-2222-222222222222",
    planCode: "STARTER",
    status: "TRIAL",
    billingCycle: "MONTHLY",
    startDate: now,
    renewalDate: now,
    currentPeriodStart: now,
    currentPeriodEnd: now,
    autoRenew: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("TRIAL and ACTIVE subscriptions are operable; SUSPENDED/CANCELLED are not", () => {
  assert.equal(isSubscriptionOperable(aSubscription({ status: "TRIAL" })), true);
  assert.equal(isSubscriptionOperable(aSubscription({ status: "ACTIVE" })), true);
  assert.equal(isSubscriptionOperable(aSubscription({ status: "SUSPENDED" })), false);
  assert.equal(isSubscriptionOperable(aSubscription({ status: "CANCELLED" })), false);
});

test("allows TRIAL -> ACTIVE/CANCELLED, ACTIVE <-> SUSPENDED, both -> CANCELLED", () => {
  assert.equal(canTransitionSubscription("TRIAL", "ACTIVE"), true);
  assert.equal(canTransitionSubscription("TRIAL", "CANCELLED"), true);
  assert.equal(canTransitionSubscription("ACTIVE", "SUSPENDED"), true);
  assert.equal(canTransitionSubscription("SUSPENDED", "ACTIVE"), true);
  assert.equal(canTransitionSubscription("ACTIVE", "CANCELLED"), true);
  assert.equal(canTransitionSubscription("SUSPENDED", "CANCELLED"), true);
});

test("CANCELLED is terminal", () => {
  assert.equal(canTransitionSubscription("CANCELLED", "ACTIVE"), false);
});

test("transitionSubscription throws on an invalid transition", () => {
  assert.throws(
    () => transitionSubscription(aSubscription({ status: "CANCELLED" }), "ACTIVE", new Date()),
    InvalidSubscriptionTransitionError,
  );
});

test("transitionSubscription sets cancellationDate only when moving to CANCELLED", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const cancelled = transitionSubscription(aSubscription({ status: "ACTIVE" }), "CANCELLED", now);
  assert.equal(cancelled.cancellationDate, now);

  const suspended = transitionSubscription(aSubscription({ status: "ACTIVE" }), "SUSPENDED", now);
  assert.equal(suspended.cancellationDate, null);
});
