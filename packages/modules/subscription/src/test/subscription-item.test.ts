import { test } from "node:test";
import assert from "node:assert/strict";
import { activateSubscriptionItem, type SubscriptionItem } from "../domain/subscription-item.js";

test("activateSubscriptionItem preserves scopeRefId across activation", () => {
  const item: SubscriptionItem = {
    id: "item-1",
    subscriptionId: "sub-1",
    serviceId: "SEATS",
    scopeRefId: "branch-palermo",
    status: "INACTIVE",
    quantity: 12,
    unitPrice: 500,
    activatedAt: new Date("2026-01-01"),
  };
  const activated = activateSubscriptionItem(item, new Date("2026-02-01"));
  assert.equal(activated.scopeRefId, "branch-palermo");
  assert.equal(activated.status, "ACTIVE");
});
