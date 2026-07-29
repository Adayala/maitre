import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubscription } from "../application/create-subscription.js";
import {
  addQuantityItem,
  MissingScopeRefError,
  InvalidQuantityForServiceError,
  CatalogItemNotFoundError,
} from "../application/add-quantity-item.js";
import { updateQuantity, SubscriptionItemNotFoundError } from "../application/update-quantity.js";
import { SubscriptionNotOperableError } from "../application/add-service.js";
import {
  FakeSubscriptionRepository,
  FakeSubscriptionItemRepository,
  FakeEntitlementRepository,
  FakeCatalogRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import type { CatalogItem } from "../domain/catalog-item.js";

const now = new Date("2026-02-01T00:00:00Z");

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

async function deps() {
  const subscriptions = new FakeSubscriptionRepository();
  const subscriptionItems = new FakeSubscriptionItemRepository();
  const entitlements = new FakeEntitlementRepository();
  const catalog = new FakeCatalogRepository([seats]);
  const outbox = new FakeOutboxRepository();
  const subscription = await createSubscription(
    { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
    { tenantId: "tenant-1", planCode: "PROFESSIONAL" },
  );
  return { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription };
}

test("addQuantityItem creates a QUANTITY item scoped to a branch", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  const item = await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );

  assert.equal(item.quantity, 12);
  assert.equal(item.scopeRefId, "branch-palermo");
  assert.equal(item.unitPrice, 500);
});

test("addQuantityItem rejects a QUANTITY catalog item without scopeRefId when scope is not TENANT", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await assert.rejects(
    addQuantityItem(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      { subscriptionId: subscription.id, catalogItemCode: "SEATS", quantity: 12 },
    ),
    MissingScopeRefError,
  );
});

test("addQuantityItem rejects a non-positive quantity for a QUANTITY catalog item", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await assert.rejects(
    addQuantityItem(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      {
        subscriptionId: subscription.id,
        catalogItemCode: "SEATS",
        quantity: 0,
        scopeRefId: "branch-palermo",
      },
    ),
    InvalidQuantityForServiceError,
  );
});

test("addQuantityItem rejects a non-integer quantity for a QUANTITY catalog item", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await assert.rejects(
    addQuantityItem(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      {
        subscriptionId: subscription.id,
        catalogItemCode: "SEATS",
        quantity: 1.5,
        scopeRefId: "branch-palermo",
      },
    ),
    InvalidQuantityForServiceError,
  );
});

test("addQuantityItem rejects an unknown or inactive catalog item code", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await assert.rejects(
    addQuantityItem(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      {
        subscriptionId: subscription.id,
        catalogItemCode: "DOES_NOT_EXIST",
        quantity: 1,
        scopeRefId: "branch-palermo",
      },
    ),
    CatalogItemNotFoundError,
  );
});

test("addQuantityItem rejects a non-operable subscription", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();
  await subscriptions.save({ ...subscription, status: "CANCELLED" });

  await assert.rejects(
    addQuantityItem(
      { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
      {
        subscriptionId: subscription.id,
        catalogItemCode: "SEATS",
        quantity: 12,
        scopeRefId: "branch-palermo",
      },
    ),
    SubscriptionNotOperableError,
  );
});

test("addQuantityItem raises the linked entitlement to the item's quantity", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );

  const seatsEntitlement = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "SEATS[branch-palermo]",
  );
  assert.equal(seatsEntitlement?.hardLimit, 12);
});

test("updateQuantity updates an existing item's quantity and recalculates entitlements", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  const item = await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );

  const updated = await updateQuantity(
    { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
    { subscriptionId: subscription.id, itemId: item.id, quantity: 20 },
  );

  assert.equal(updated.quantity, 20);
  const seatsEntitlement = (await entitlements.listBySubscription(subscription.id)).find(
    (e) => e.resource === "SEATS[branch-palermo]",
  );
  assert.equal(seatsEntitlement?.hardLimit, 20);
});

test("updateQuantity rejects a non-positive quantity", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  const item = await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );

  await assert.rejects(
    updateQuantity(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { subscriptionId: subscription.id, itemId: item.id, quantity: 0 },
    ),
    InvalidQuantityForServiceError,
  );
});

test("updateQuantity rejects a non-integer quantity", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  const item = await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );

  await assert.rejects(
    updateQuantity(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { subscriptionId: subscription.id, itemId: item.id, quantity: 1.5 },
    ),
    InvalidQuantityForServiceError,
  );
});

test("updateQuantity rejects an unknown itemId", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, subscription } = await deps();

  await assert.rejects(
    updateQuantity(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { subscriptionId: subscription.id, itemId: "does-not-exist", quantity: 5 },
    ),
    SubscriptionItemNotFoundError,
  );
});

test("updateQuantity rejects a non-operable subscription", async () => {
  const { subscriptions, subscriptionItems, entitlements, catalog, outbox, subscription } =
    await deps();

  const item = await addQuantityItem(
    { subscriptions, subscriptionItems, entitlements, catalog, outbox, now: () => now },
    {
      subscriptionId: subscription.id,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    },
  );
  await subscriptions.save({ ...subscription, status: "CANCELLED" });

  await assert.rejects(
    updateQuantity(
      { subscriptions, subscriptionItems, entitlements, catalog, now: () => now },
      { subscriptionId: subscription.id, itemId: item.id, quantity: 20 },
    ),
    SubscriptionNotOperableError,
  );
});
