import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import { addService, SubscriptionNotOperableError } from "../application/add-service.js";
import { removeService, ServiceNotFoundError } from "../application/remove-service.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
  FakeOutboxRepository,
} from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");

async function deps() {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const outbox = new FakeOutboxRepository();
  const subscription = await createSubscription(
    { subscriptions, subscriptionItems, entitlements, now: () => now },
    { tenantId: "tenant-1", planCode: "STARTER" },
  );
  return { subscriptions, subscriptionItems, entitlements, outbox, subscription };
}

test("addService activates a service and raises the linked entitlement", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();

  await addService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );

  const items = await subscriptionItems.listBySubscription(subscription.id);
  assert.equal(items[0]!.status, "ACTIVE");

  const branches = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "branches",
  );
  assert.equal(branches?.hardLimit, 10);
});

test("addService appends ServiceActivated to the outbox with the subscription's tenantId", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );
  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]!.eventName, "ServiceActivated");
  assert.equal(outbox.records[0]!.tenantId, "tenant-1");
});

test("addService rejects a non-operable (e.g. cancelled) subscription", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();
  await subscriptions.save({ ...subscription, status: "CANCELLED" });

  await assert.rejects(
    addService(
      { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
      { subscriptionId: subscription.id, serviceId: "floor" },
    ),
    SubscriptionNotOperableError,
  );
});

test("removeService deactivates a service and lowers entitlements back to plan defaults", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );

  await removeService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );

  const items = await subscriptionItems.listBySubscription(subscription.id);
  assert.equal(items[0]!.status, "INACTIVE");

  const branches = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "branches",
  );
  assert.equal(branches?.hardLimit, 1); // back to STARTER default
});

test("removeService appends ServiceDeactivated to the outbox", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );
  await removeService(
    { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "floor" },
  );
  assert.equal(outbox.records[outbox.records.length - 1]!.eventName, "ServiceDeactivated");
});

test("removeService rejects an unknown serviceId", async () => {
  const { subscriptions, subscriptionItems, entitlements, outbox, subscription } = await deps();
  await assert.rejects(
    removeService(
      { subscriptions, subscriptionItems, entitlements, outbox, now: () => now },
      { subscriptionId: subscription.id, serviceId: "does-not-exist" },
    ),
    ServiceNotFoundError,
  );
});
