import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FakeOrderRepository,
  FakeKitchenTicketRepository,
  FakeCapabilityTokenRepository,
  FakeSpecialRequestRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import { createOrder, addOrderItem, submitOrder } from "../application/order-commands.js";
import {
  startKitchenTicket,
  markKitchenTicketReady,
  completeKitchenTicket,
  cancelKitchenTicket,
} from "../application/kitchen-ticket-commands.js";
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
import { InvalidKitchenTicketTransitionError } from "../domain/kitchen-ticket.js";

function orderDeps() {
  return {
    orders: new FakeOrderRepository(),
    kitchenTickets: new FakeKitchenTicketRepository(),
    outbox: new FakeOutboxRepository(),
  };
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

test("kitchen ticket start/mark-ready/complete transitions the order to DELIVERED", async () => {
  const d = orderDeps();
  const { ticket } = await submittedOrder(d);

  const started = await startKitchenTicket(d, { tenantId: "t1", ticketId: ticket.id });
  assert.equal(started.status, "IN_PREP");
  let order = await d.orders.findById("t1", ticket.orderId);
  assert.equal(order!.status, "IN_PREP");

  const ready = await markKitchenTicketReady(d, { tenantId: "t1", ticketId: ticket.id });
  assert.equal(ready.status, "READY");
  order = await d.orders.findById("t1", ticket.orderId);
  assert.equal(order!.status, "READY");

  const done = await completeKitchenTicket(d, { tenantId: "t1", ticketId: ticket.id });
  assert.equal(done.status, "COMPLETED");
  order = await d.orders.findById("t1", ticket.orderId);
  assert.equal(order!.status, "DELIVERED");

  const names = d.outbox.records.map((r) => r.eventName);
  assert.ok(names.includes("ordering.order.ready.v1"));
  assert.ok(names.includes("ordering.order.delivered.v1"));
});

test("kitchen ticket cannot skip states", async () => {
  const d = orderDeps();
  const { ticket } = await submittedOrder(d);
  await assert.rejects(
    () => markKitchenTicketReady(d, { tenantId: "t1", ticketId: ticket.id }),
    InvalidKitchenTicketTransitionError,
  );
});

test("cancel ticket compensates production only, leaves order untouched", async () => {
  const d = orderDeps();
  const { ticket, order } = await submittedOrder(d);
  const cancelled = await cancelKitchenTicket(d, { tenantId: "t1", ticketId: ticket.id });
  assert.equal(cancelled.status, "CANCELLED");
  const reread = await d.orders.findById("t1", order.id);
  assert.equal(reread!.status, "SUBMITTED");
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

  // wrong purpose -> not resolvable (anti-enumeration)
  await assert.rejects(() => resolveCapabilityToken(caps, token, "BILL_READ"), CapabilityNotResolvableError);
  // unknown token -> not resolvable
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
