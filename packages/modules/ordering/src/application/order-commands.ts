// Order use cases (SPEC-087/089). Consolidated into one file per aggregate,
// mirroring @maitre/floor's check-commands.ts and @maitre/reservations'
// reservation-commands.ts.
//
// Cross-module note: this module stays decoupled from @maitre/catalog and
// @maitre/floor. Catalog revalidation and price/name/allergen resolution happen
// in the route layer, which passes already-resolved item snapshots into
// addOrderItem (the same decoupling Reservations used by calling Floor's
// openVisit from its route). Appending the submitted total as a Floor Check
// line is likewise done by the route after submitOrder returns — documented as
// a direct sequential call, not a transactional saga (consistent with the
// approved SPEC-089 simplification).

import { randomUUID } from "node:crypto";
import {
  type Order,
  type OrderAdjustment,
  type OrderStatus,
  computeOrderTotals,
  deriveOrderStatus,
  assertOrderDraft,
  assertOrderSubmitted,
  InvalidOrderStateError,
} from "../domain/order.js";
import {
  type OrderItem,
  type OrderItemStatus,
  assertOrderItemTransition,
  assertValidQuantity,
  orderItemLineTotal,
  isOrderItemTerminal,
} from "../domain/order-item.js";
import type { OrderModifier } from "../domain/order-modifier.js";
import { type KitchenTicket, type KitchenTicketLine } from "../domain/kitchen-ticket.js";
import type {
  OrderRepositoryPort,
  KitchenTicketRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import {
  orderSubmittedEvent,
  orderReadyEvent,
  orderDeliveredEvent,
} from "./events.js";

export interface OrderDeps {
  orders: OrderRepositoryPort;
  now?: () => Date;
}

export interface SubmitOrderDeps extends OrderDeps {
  kitchenTickets: KitchenTicketRepositoryPort;
  outbox: OutboxPort;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadOrder(deps: OrderDeps, tenantId: string, orderId: string): Promise<Order> {
  const order = await deps.orders.findById(tenantId, orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  return order;
}

// Recompute totals from items and persist. Used after any item mutation.
function withRecalculatedTotals(order: Order, now: Date): Order {
  const totals = computeOrderTotals(order.items);
  return { ...order, ...totals, updatedAt: now };
}

// POST /v1/visits/:visitId/orders — creates a DRAFT. The route resolves the
// Visit (branchId, currency) and passes them here; the server never trusts
// client-sent totals/currency for line math.
export interface CreateOrderInput {
  id?: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  currency: string;
  notes?: string;
}

export async function createOrder(deps: OrderDeps, input: CreateOrderInput): Promise<Order> {
  const now = nowFrom(deps);
  const order: Order = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    visitId: input.visitId,
    currency: input.currency,
    items: [],
    adjustments: [],
    status: "DRAFT",
    subtotalMinorUnits: 0,
    taxTotalMinorUnits: 0,
    grandTotalMinorUnits: 0,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.notes ? { notes: input.notes } : {}),
  };
  await deps.orders.save(order);
  return order;
}

export class CurrencyMismatchError extends Error {
  constructor(orderCurrency: string, itemCurrency: string) {
    super(`Item currency ${itemCurrency} does not match order currency ${orderCurrency}`);
    this.name = "CurrencyMismatchError";
  }
}

// POST /v1/orders/:id/items — DRAFT only. The snapshot (name, price, currency,
// allergens, modifiers) is resolved from Catalog by the route and frozen here.
export interface AddOrderItemInput {
  tenantId: string;
  orderId: string;
  productId: string;
  catalogRevisionId?: string;
  name: string;
  quantity: number;
  unitPriceMinorUnits: number;
  currency: string;
  modifiers?: OrderModifier[];
  allergens?: string[];
  notes?: string;
}

export async function addOrderItem(deps: OrderDeps, input: AddOrderItemInput): Promise<Order> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);
  assertOrderDraft(order);
  assertValidQuantity(input.quantity);
  if (input.currency !== order.currency) throw new CurrencyMismatchError(order.currency, input.currency);

  const item: OrderItem = {
    id: randomUUID(),
    productId: input.productId,
    name: input.name,
    quantity: input.quantity,
    unitPriceMinorUnits: input.unitPriceMinorUnits,
    currency: input.currency,
    modifiers: input.modifiers ?? [],
    allergens: input.allergens ?? [],
    status: "QUEUED",
    ...(input.catalogRevisionId ? { catalogRevisionId: input.catalogRevisionId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  const now = nowFrom(deps);
  const updated = withRecalculatedTotals(
    { ...order, items: [...order.items, item], revision: order.revision + 1 },
    now,
  );
  await deps.orders.save(updated);
  return updated;
}

function toTicketLine(item: OrderItem): KitchenTicketLine {
  const summary = item.modifiers.map((m) => m.label).join(", ");
  return {
    orderItemId: item.id,
    name: item.name,
    quantity: item.quantity,
    ...(summary ? { modifiersSummary: summary } : {}),
    ...(item.notes ? { notes: item.notes } : {}),
  };
}

// POST /v1/orders/:id/submit — DRAFT -> SUBMITTED, idempotent. Freezes the
// snapshot, creates one KitchenTicket, emits ordering.order.submitted.v1. A
// repeated submit returns the existing order + ticket without a second event.
export interface SubmitOrderInput {
  tenantId: string;
  orderId: string;
  catalogRevisionId?: string;
  correlationId?: string;
}

export interface SubmitOrderResult {
  order: Order;
  ticket: KitchenTicket;
}

export class EmptyOrderError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} has no items to submit`);
    this.name = "EmptyOrderError";
  }
}

export async function submitOrder(deps: SubmitOrderDeps, input: SubmitOrderInput): Promise<SubmitOrderResult> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);

  // Idempotent: already submitted -> return as-is with its existing ticket.
  if (order.status !== "DRAFT") {
    const existing = await deps.kitchenTickets.findByOrder(input.tenantId, order.id);
    if (!existing) throw new InvalidOrderStateError(`Order ${order.id} is ${order.status} but has no KitchenTicket`);
    return { order, ticket: existing };
  }

  if (order.items.length === 0) throw new EmptyOrderError(order.id);

  const now = nowFrom(deps);
  const submitted: Order = withRecalculatedTotals(
    {
      ...order,
      status: "SUBMITTED",
      submittedAt: now,
      revision: order.revision + 1,
      ...(input.catalogRevisionId ? { catalogRevisionId: input.catalogRevisionId } : {}),
    },
    now,
  );
  await deps.orders.save(submitted);

  const ticket: KitchenTicket = {
    id: randomUUID(),
    tenantId: submitted.tenantId,
    branchId: submitted.branchId,
    visitId: submitted.visitId,
    orderId: submitted.id,
    orderRevision: submitted.revision,
    status: "QUEUED",
    lines: submitted.items.map(toTicketLine),
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.kitchenTickets.save(ticket);

  const correlationId = input.correlationId ?? randomUUID();
  await deps.outbox.append(orderSubmittedEvent(submitted, correlationId));
  return { order: submitted, ticket };
}

// Emits the aggregate ready/delivered events when a mutation moves the derived
// status across those thresholds. Returns the correctly-revised order.
async function applyDerivedStatus(
  deps: { orders: OrderRepositoryPort; outbox?: OutboxPort },
  order: Order,
  now: Date,
  correlationId: string,
): Promise<Order> {
  const previousStatus = order.status;
  const nextStatus = deriveOrderStatus(order.items);
  const recalculated = computeOrderTotals(order.items);
  const updated: Order = {
    ...order,
    ...recalculated,
    status: nextStatus,
    revision: order.revision + 1,
    updatedAt: now,
    ...(nextStatus === "CANCELLED" && !order.cancelledAt ? { cancelledAt: now } : {}),
  };
  await deps.orders.save(updated);

  if (deps.outbox && nextStatus !== previousStatus) {
    if (nextStatus === "READY") await deps.outbox.append(orderReadyEvent(updated, now, correlationId));
    if (nextStatus === "DELIVERED") await deps.outbox.append(orderDeliveredEvent(updated, now, correlationId));
  }
  return updated;
}

// POST /v1/orders/:id/items/:itemId/transition — moves a single item along its
// monotonic lifecycle (used for granular delivery, order.deliver permission).
export interface TransitionOrderItemInput {
  tenantId: string;
  orderId: string;
  orderItemId: string;
  to: OrderItemStatus;
  correlationId?: string;
}

export interface TransitionOrderItemDeps extends OrderDeps {
  outbox: OutboxPort;
}

export async function transitionOrderItem(
  deps: TransitionOrderItemDeps,
  input: TransitionOrderItemInput,
): Promise<Order> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);
  assertOrderSubmitted(order);
  const item = order.items.find((i) => i.id === input.orderItemId);
  if (!item) throw new Error(`OrderItem ${input.orderItemId} not found`);
  assertOrderItemTransition(item.status, input.to);

  const now = nowFrom(deps);
  const items = order.items.map((i) => (i.id === item.id ? { ...i, status: input.to } : i));
  return applyDerivedStatus(deps, { ...order, items }, now, input.correlationId ?? randomUUID());
}

// POST /v1/orders/:id/cancel — cancels all still-cancellable items (SPEC-087:
// "no borra la orden ni reescribe items"). Each cancelled item records an
// OrderAdjustment with a negative delta equal to its removed line total. Works
// pre- and post-submit; re-derives to CANCELLED when every item is cancelled.
export interface CancelOrderInput {
  tenantId: string;
  orderId: string;
  reasonCode: string;
  actorType: string;
  correlationId?: string;
}

export interface CancelOrderDeps extends OrderDeps {
  outbox: OutboxPort;
}

export async function cancelOrder(deps: CancelOrderDeps, input: CancelOrderInput): Promise<Order> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);
  if (order.status === "CANCELLED") return order;

  const now = nowFrom(deps);
  const newAdjustments: OrderAdjustment[] = [];
  const items = order.items.map((item) => {
    if (isOrderItemTerminal(item)) return item;
    newAdjustments.push({
      id: randomUUID(),
      reasonCode: input.reasonCode,
      actorType: input.actorType,
      deltaAmountMinorUnits: -orderItemLineTotal(item),
      orderItemId: item.id,
      createdAt: now,
    });
    return { ...item, status: "CANCELLED" as OrderItemStatus, cancelReason: input.reasonCode, cancelledAt: now };
  });

  const withAdjustments: Order = { ...order, items, adjustments: [...order.adjustments, ...newAdjustments] };
  // DRAFT cancel: go straight to CANCELLED without derivation/events.
  if (order.status === "DRAFT") {
    const totals = computeOrderTotals(items);
    const updated: Order = {
      ...withAdjustments,
      ...totals,
      status: "CANCELLED",
      cancelledAt: now,
      revision: order.revision + 1,
      updatedAt: now,
    };
    await deps.orders.save(updated);
    return updated;
  }
  return applyDerivedStatus(deps, withAdjustments, now, input.correlationId ?? randomUUID());
}

// POST /v1/orders/:id/items/:itemId/cancel (SPEC-089 cancel-quantity, simplified
// to whole-item). Cancels one item post-submit and records the adjustment.
export interface CancelOrderItemInput {
  tenantId: string;
  orderId: string;
  orderItemId: string;
  reasonCode: string;
  actorType: string;
  correlationId?: string;
}

export async function cancelOrderItem(deps: CancelOrderDeps, input: CancelOrderItemInput): Promise<Order> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);
  const item = order.items.find((i) => i.id === input.orderItemId);
  if (!item) throw new Error(`OrderItem ${input.orderItemId} not found`);
  if (isOrderItemTerminal(item)) {
    throw new InvalidOrderStateError(`OrderItem ${item.id} is already ${item.status}`);
  }

  const now = nowFrom(deps);
  const adjustment: OrderAdjustment = {
    id: randomUUID(),
    reasonCode: input.reasonCode,
    actorType: input.actorType,
    deltaAmountMinorUnits: -orderItemLineTotal(item),
    orderItemId: item.id,
    createdAt: now,
  };
  const items = order.items.map((i) =>
    i.id === item.id ? { ...i, status: "CANCELLED" as OrderItemStatus, cancelReason: input.reasonCode, cancelledAt: now } : i,
  );
  const withAdjustment: Order = { ...order, items, adjustments: [...order.adjustments, adjustment] };

  if (order.status === "DRAFT") {
    const updated = withRecalculatedTotals({ ...withAdjustment, revision: order.revision + 1 }, now);
    await deps.orders.save(updated);
    return updated;
  }
  return applyDerivedStatus(deps, withAdjustment, now, input.correlationId ?? randomUUID());
}

// POST /v1/orders/:id/items/:itemId/change-quantity (SPEC-089 change-quantity,
// simplified). Only for non-terminal items; records the signed price delta.
export interface ChangeOrderItemQuantityInput {
  tenantId: string;
  orderId: string;
  orderItemId: string;
  newQuantity: number;
  reasonCode: string;
  actorType: string;
}

export async function changeOrderItemQuantity(
  deps: OrderDeps,
  input: ChangeOrderItemQuantityInput,
): Promise<Order> {
  const order = await loadOrder(deps, input.tenantId, input.orderId);
  const item = order.items.find((i) => i.id === input.orderItemId);
  if (!item) throw new Error(`OrderItem ${input.orderItemId} not found`);
  if (isOrderItemTerminal(item)) {
    throw new InvalidOrderStateError(`OrderItem ${item.id} is ${item.status}, cannot change quantity`);
  }
  assertValidQuantity(input.newQuantity);

  const before = orderItemLineTotal(item);
  const changedItem: OrderItem = { ...item, quantity: input.newQuantity };
  const after = orderItemLineTotal(changedItem);

  const now = nowFrom(deps);
  const adjustment: OrderAdjustment = {
    id: randomUUID(),
    reasonCode: input.reasonCode,
    actorType: input.actorType,
    deltaAmountMinorUnits: after - before,
    orderItemId: item.id,
    createdAt: now,
  };
  const items = order.items.map((i) => (i.id === item.id ? changedItem : i));
  const updated = withRecalculatedTotals(
    { ...order, items, adjustments: [...order.adjustments, adjustment], revision: order.revision + 1 },
    now,
  );
  await deps.orders.save(updated);
  return updated;
}

export type { OrderStatus };
