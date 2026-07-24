import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FakeOrderRepository,
  FakeKitchenTicketRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import {
  createOrder,
  addOrderItem,
  submitOrder,
  cancelOrder,
  cancelOrderItem,
  transitionOrderItem,
  EmptyOrderError,
} from "../application/order-commands.js";
import { deriveOrderStatus } from "../domain/order.js";
import { assertOrderItemTransition, InvalidOrderItemTransitionError } from "../domain/order-item.js";

function deps() {
  return {
    orders: new FakeOrderRepository(),
    kitchenTickets: new FakeKitchenTicketRepository(),
    outbox: new FakeOutboxRepository(),
  };
}

async function seedDraftWithItem(d: ReturnType<typeof deps>) {
  const order = await createOrder(d, {
    tenantId: "t1",
    branchId: "b1",
    visitId: "v1",
    currency: "ARS",
  });
  return addOrderItem(d, {
    tenantId: "t1",
    orderId: order.id,
    productId: "p1",
    name: "Empanada",
    quantity: 2,
    unitPriceMinorUnits: 350000,
    currency: "ARS",
  });
}

test("addOrderItem computes exact line totals from minor units", async () => {
  const d = deps();
  const order = await seedDraftWithItem(d);
  assert.equal(order.subtotalMinorUnits, 700000);
  assert.equal(order.grandTotalMinorUnits, 700000);
  assert.equal(order.taxTotalMinorUnits, 0);
  assert.equal(order.status, "DRAFT");
});

test("submit freezes snapshot, creates one KitchenTicket, emits submitted event", async () => {
  const d = deps();
  const draft = await seedDraftWithItem(d);
  const { order, ticket } = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  assert.equal(order.status, "SUBMITTED");
  assert.ok(order.submittedAt);
  assert.equal(ticket.orderId, order.id);
  assert.equal(ticket.status, "QUEUED");
  assert.equal(ticket.lines.length, 1);
  const events = d.outbox.records.map((r) => r.eventName);
  assert.deepEqual(events, ["ordering.order.submitted.v1"]);
});

test("submit is idempotent — second submit emits no second event", async () => {
  const d = deps();
  const draft = await seedDraftWithItem(d);
  const first = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  const second = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  assert.equal(second.order.revision, first.order.revision);
  assert.equal(second.ticket.id, first.ticket.id);
  assert.equal(d.outbox.records.length, 1);
});

test("empty order cannot be submitted", async () => {
  const d = deps();
  const order = await createOrder(d, { tenantId: "t1", branchId: "b1", visitId: "v1", currency: "ARS" });
  await assert.rejects(() => submitOrder(d, { tenantId: "t1", orderId: order.id }), EmptyOrderError);
});

test("order status derivation follows SPEC-081 precedence", () => {
  const base = { id: "i", productId: "p", name: "n", quantity: 1, unitPriceMinorUnits: 0, currency: "ARS", modifiers: [] as never[], allergens: [] as string[] };
  assert.equal(deriveOrderStatus([{ ...base, status: "QUEUED" }]), "SUBMITTED");
  assert.equal(deriveOrderStatus([{ ...base, status: "IN_PREP" }]), "IN_PREP");
  assert.equal(deriveOrderStatus([{ ...base, status: "READY" }]), "READY");
  assert.equal(deriveOrderStatus([{ ...base, id: "a", status: "READY" }, { ...base, id: "b", status: "IN_PREP" }]), "IN_PREP");
  assert.equal(deriveOrderStatus([{ ...base, id: "a", status: "DELIVERED" }, { ...base, id: "b", status: "READY" }]), "PARTIALLY_DELIVERED");
  assert.equal(deriveOrderStatus([{ ...base, id: "a", status: "DELIVERED" }, { ...base, id: "b", status: "CANCELLED" }]), "DELIVERED");
  assert.equal(deriveOrderStatus([{ ...base, status: "CANCELLED" }]), "CANCELLED");
});

test("cancel order records an adjustment per cancelled item and derives CANCELLED", async () => {
  const d = deps();
  const draft = await seedDraftWithItem(d);
  const { order } = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  const cancelled = await cancelOrder(d, {
    tenantId: "t1",
    orderId: order.id,
    reasonCode: "GUEST_REQUEST",
    actorType: "WAITER",
  });
  assert.equal(cancelled.status, "CANCELLED");
  assert.equal(cancelled.adjustments.length, 1);
  assert.equal(cancelled.adjustments[0]!.deltaAmountMinorUnits, -700000);
  assert.equal(cancelled.subtotalMinorUnits, 0);
});

test("cancel a single item post-submit records an adjustment", async () => {
  const d = deps();
  const draft = await seedDraftWithItem(d);
  const { order } = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  const itemId = order.items[0]!.id;
  const updated = await cancelOrderItem(d, {
    tenantId: "t1",
    orderId: order.id,
    orderItemId: itemId,
    reasonCode: "86",
    actorType: "COOK",
  });
  assert.equal(updated.adjustments.length, 1);
  assert.equal(updated.status, "CANCELLED");
});

test("transitionOrderItem drives derived order status and delivered event", async () => {
  const d = deps();
  const draft = await seedDraftWithItem(d);
  const { order } = await submitOrder(d, { tenantId: "t1", orderId: draft.id });
  const itemId = order.items[0]!.id;
  await transitionOrderItem(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "IN_PREP" });
  await transitionOrderItem(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "READY" });
  const delivered = await transitionOrderItem(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "DELIVERED" });
  assert.equal(delivered.status, "DELIVERED");
  const names = d.outbox.records.map((r) => r.eventName);
  assert.ok(names.includes("ordering.order.ready.v1"));
  assert.ok(names.includes("ordering.order.delivered.v1"));
});

test("order item transitions are monotonic", () => {
  assert.throws(() => assertOrderItemTransition("DELIVERED", "READY"), InvalidOrderItemTransitionError);
  assert.throws(() => assertOrderItemTransition("QUEUED", "DELIVERED"), InvalidOrderItemTransitionError);
});
