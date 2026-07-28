import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import { addService, SubscriptionNotOperableError } from "../application/add-service.js";
import { removeService, ServiceNotFoundError } from "../application/remove-service.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
  FakeCatalogRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import type { CatalogItem } from "../domain/catalog-item.js";

const now = new Date("2026-05-01T00:00:00Z");

const seats: CatalogItem = {
  code: "seats",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "TENANT",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: [],
  isActive: true,
  version: 1,
};

async function deps() {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository([seats]);
  const outbox = new FakeOutboxRepository();
  const subscription = await createSubscription(
    { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
    { tenantId: "tenant-1", planCode: "STARTER" },
  );
  return { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription };
}

test("addService activates a QUANTITY service and raises the linked entitlement to its quantity", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await addService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats", quantity: 10 },
  );

  const items = await subscriptionItems.listBySubscription(subscription.id);
  assert.equal(items[0]!.status, "ACTIVE");

  const seatsEntitlement = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "seats",
  );
  assert.equal(seatsEntitlement?.hardLimit, 10);
});

test("addService appends ServiceActivated to the outbox with the subscription's tenantId", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats" },
  );
  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]!.eventName, "ServiceActivated");
  assert.equal(outbox.records[0]!.tenantId, "tenant-1");
});

test("addService rejects a non-operable (e.g. cancelled) subscription", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await subscriptions.save({ ...subscription, status: "CANCELLED" });

  await assert.rejects(
    addService(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      { subscriptionId: subscription.id, serviceId: "seats" },
    ),
    SubscriptionNotOperableError,
  );
});

test("removeService deactivates a service; its entitlement row is no longer recalculated (stale, not deleted)", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats", quantity: 10 },
  );

  await removeService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats" },
  );

  const items = await subscriptionItems.listBySubscription(subscription.id);
  assert.equal(items[0]!.status, "INACTIVE");

  // recalculateEntitlements only upserts resources still derivable from
  // active items; it does not delete entitlements for resources that drop
  // out of the calculation. This is a known limitation, not asserted away.
  const seatsEntitlement = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "seats",
  );
  assert.equal(seatsEntitlement?.hardLimit, 10);
});

test("removeService appends ServiceDeactivated to the outbox", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await addService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats" },
  );
  await removeService(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    { subscriptionId: subscription.id, serviceId: "seats" },
  );
  assert.equal(outbox.records[outbox.records.length - 1]!.eventName, "ServiceDeactivated");
});

test("removeService rejects an unknown serviceId", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await assert.rejects(
    removeService(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      { subscriptionId: subscription.id, serviceId: "does-not-exist" },
    ),
    ServiceNotFoundError,
  );
});
