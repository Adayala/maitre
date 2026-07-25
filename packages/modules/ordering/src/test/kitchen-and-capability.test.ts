import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FakeOrderRepository,
  FakeCapabilityTokenRepository,
  FakeSpecialRequestRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import { createOrder, addOrderItem, submitOrder, applyKitchenItemStatus } from "../application/order-commands.js";
import {
  issueCapabilityToken,
  resolveCapabilityToken,
  revokeCapabilityToken,
  CapabilityNotResolvableError,
} from "../application/capability-commands.js";
import {
  createSpecialRequest,
  acceptSpecialRequest,
  fulfillSpecialRequest,
  rejectSpecialRequest,
} from "../application/special-request-commands.js";
import { InvalidSpecialRequestTransitionError } from "../domain/special-request.js";

function orderDeps() {
  return { orders: new FakeOrderRepository(), outbox: new FakeOutboxRepository() };
}

async function submittedOrder(d: ReturnType<typeof orderDeps>) {
  const order = await createOrder(d, { tenantId: "t1", branchId: "b1", visitId: "v1", currency: "ARS" });
  await addOrderItem(d, {
    tenantId: "t1",
    orderId: order.id,
    productId: "p1",
    name: "Empanada",
    quantity: 1,
    unitPriceMinorUnits: 350000,
    currency: "ARS",
  });
  return submitOrder(d, { tenantId: "t1", orderId: order.id });
}

test("submit freezes the order and emits submitted (no in-module KitchenTicket)", async () => {
  const d = orderDeps();
  const { order } = await submittedOrder(d);
  assert.equal(order.status, "SUBMITTED");
  assert.equal(d.outbox.records.at(-1)?.eventName, "ordering.order.submitted.v1");
  // Idempotent second submit, no second event.
  const again = await submitOrder(d, { tenantId: "t1", orderId: order.id });
  assert.equal(again.order.status, "SUBMITTED");
  assert.equal(d.outbox.records.filter((r) => r.eventName === "ordering.order.submitted.v1").length, 1);
});

test("applyKitchenItemStatus advances the item and re-derives the Order to DELIVERED", async () => {
  const d = orderDeps();
  const { order } = await submittedOrder(d);
  const itemId = order.items[0]!.id;

  // Kitchen Command IN_PROGRESS -> item IN_PREP -> Order IN_PREP.
  let updated = await applyKitchenItemStatus(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "IN_PREP" });
  assert.equal(updated!.status, "IN_PREP");

  // READY -> Order READY (emits ready event).
  updated = await applyKitchenItemStatus(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "READY" });
  assert.equal(updated!.status, "READY");

  // DELIVERED (handoff) -> Order DELIVERED (emits delivered event).
  updated = await applyKitchenItemStatus(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "DELIVERED" });
  assert.equal(updated!.status, "DELIVERED");

  const names = d.outbox.records.map((r) => r.eventName);
  assert.ok(names.includes("ordering.order.ready.v1"));
  assert.ok(names.includes("ordering.order.delivered.v1"));
});

test("applyKitchenItemStatus is idempotent and tolerant of illegal transitions", async () => {
  const d = orderDeps();
  const { order } = await submittedOrder(d);
  const itemId = order.items[0]!.id;
  // Unknown order -> null, no throw.
  assert.equal(await applyKitchenItemStatus(d, { tenantId: "t1", orderId: "nope", orderItemId: itemId, to: "READY" }), null);
  // Illegal jump QUEUED -> DELIVERED is skipped (no error), Order unchanged.
  const same = await applyKitchenItemStatus(d, { tenantId: "t1", orderId: order.id, orderItemId: itemId, to: "DELIVERED" });
  assert.equal(same!.status, "SUBMITTED");
});

test("capability token resolves only when ACTIVE and not expired", async () => {
  const caps = { capabilityTokens: new FakeCapabilityTokenRepository() };
  const { token } = await issueCapabilityToken(caps, {
    tenantId: "t1",
    purpose: "MENU_READ",
    resourceId: "menu1",
    branchId: "b1",
  });
  const resolved = await resolveCapabilityToken(caps, token, "MENU_READ");
  assert.equal(resolved.resourceId, "menu1");

  await assert.rejects(() => resolveCapabilityToken(caps, token, "BILL_READ"), CapabilityNotResolvableError);
  await assert.rejects(() => resolveCapabilityToken(caps, "garbage", "MENU_READ"), CapabilityNotResolvableError);
});

test("expired capability token fails closed and flips to EXPIRED", async () => {
  const caps = { capabilityTokens: new FakeCapabilityTokenRepository() };
  const base = new Date("2026-07-24T10:00:00Z");
  const { token, record } = await issueCapabilityToken(
    { ...caps, now: () => base },
    { tenantId: "t1", purpose: "BILL_READ", resourceId: "check1", ttlSeconds: 60 },
  );
  const later = new Date(base.getTime() + 120_000);
  await assert.rejects(
    () => resolveCapabilityToken({ ...caps, now: () => later }, token, "BILL_READ"),
    CapabilityNotResolvableError,
  );
  const reread = await caps.capabilityTokens.findById("t1", record.id);
  assert.equal(reread!.status, "EXPIRED");
});

test("revoked capability token is not resolvable", async () => {
  const caps = { capabilityTokens: new FakeCapabilityTokenRepository() };
  const { token, record } = await issueCapabilityToken(caps, {
    tenantId: "t1",
    purpose: "ORDER_TRACK_READ",
    resourceId: "order1",
  });
  await revokeCapabilityToken(caps, { tenantId: "t1", id: record.id });
  await assert.rejects(() => resolveCapabilityToken(caps, token, "ORDER_TRACK_READ"), CapabilityNotResolvableError);
});

test("special request lifecycle: create, accept, fulfill", async () => {
  const deps = { specialRequests: new FakeSpecialRequestRepository() };
  const request = await createSpecialRequest(deps, {
    tenantId: "t1",
    requestType: "BIRTHDAY",
    targetType: "VISIT",
    targetId: "v1",
    freeText: "  Bring   a  candle  ",
  });
  assert.equal(request.status, "PENDING");
  assert.equal(request.freeText, "Bring a candle");

  const accepted = await acceptSpecialRequest(deps, { tenantId: "t1", id: request.id, actor: "MANAGER" });
  assert.equal(accepted.status, "ACCEPTED");
  const fulfilled = await fulfillSpecialRequest(deps, { tenantId: "t1", id: request.id, actor: "WAITER" });
  assert.equal(fulfilled.status, "FULFILLED");
});

test("special request cannot fulfill before accept", async () => {
  const deps = { specialRequests: new FakeSpecialRequestRepository() };
  const request = await createSpecialRequest(deps, {
    tenantId: "t1",
    requestType: "ALLERGY_NOTE",
    targetType: "ORDER",
    targetId: "o1",
  });
  await assert.rejects(
    () => fulfillSpecialRequest(deps, { tenantId: "t1", id: request.id }),
    InvalidSpecialRequestTransitionError,
  );
  const rejected = await rejectSpecialRequest(deps, { tenantId: "t1", id: request.id, reasonCode: "CANNOT_ACCOMMODATE" });
  assert.equal(rejected.status, "REJECTED");
});
