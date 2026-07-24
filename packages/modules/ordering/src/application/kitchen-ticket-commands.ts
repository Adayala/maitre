// KitchenTicket use cases (SPEC-086, BASIC placeholder — see kitchen-ticket.ts).
//
// These commands drive BOTH the KitchenTicket status and the underlying Order's
// item statuses, then re-derive the Order status and emit the aggregate
// ready/delivered events. This is the path by which start/mark-ready/complete
// move the Order through IN_PREP -> READY -> DELIVERED. `cancel` compensates
// only the production flow and leaves the Order untouched (SPEC-086: "cancel
// sólo compensa el flujo productivo; el impacto comercial sigue gobernado por
// Order/Check").

import { randomUUID } from "node:crypto";
import {
  type KitchenTicket,
  type KitchenTicketStatus,
  assertKitchenTicketTransition,
} from "../domain/kitchen-ticket.js";
import {
  type Order,
  computeOrderTotals,
  deriveOrderStatus,
} from "../domain/order.js";
import { type OrderItemStatus, canTransitionOrderItem } from "../domain/order-item.js";
import type { KitchenTicketRepositoryPort, OrderRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { orderReadyEvent, orderDeliveredEvent } from "./events.js";

export interface KitchenTicketDeps {
  kitchenTickets: KitchenTicketRepositoryPort;
  orders: OrderRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadTicket(deps: KitchenTicketDeps, tenantId: string, ticketId: string): Promise<KitchenTicket> {
  const ticket = await deps.kitchenTickets.findById(tenantId, ticketId);
  if (!ticket) throw new Error(`KitchenTicket ${ticketId} not found`);
  return ticket;
}

// Moves every order item currently in `from` to `to` (when the item transition
// is legal), re-derives the order, persists it, and emits the ready/delivered
// aggregate event if the derived status crossed that threshold.
async function advanceOrderItems(
  deps: KitchenTicketDeps,
  ticket: KitchenTicket,
  from: OrderItemStatus,
  to: OrderItemStatus,
  now: Date,
  correlationId: string,
): Promise<void> {
  const order = await deps.orders.findById(ticket.tenantId, ticket.orderId);
  if (!order) return;
  const previousStatus = order.status;
  const items = order.items.map((i) => (i.status === from && canTransitionOrderItem(i.status, to) ? { ...i, status: to } : i));
  const nextStatus = deriveOrderStatus(items);
  const updated: Order = {
    ...order,
    items,
    ...computeOrderTotals(items),
    status: nextStatus,
    revision: order.revision + 1,
    updatedAt: now,
  };
  await deps.orders.save(updated);
  if (nextStatus !== previousStatus) {
    if (nextStatus === "READY") await deps.outbox.append(orderReadyEvent(updated, now, correlationId));
    if (nextStatus === "DELIVERED") await deps.outbox.append(orderDeliveredEvent(updated, now, correlationId));
  }
}

async function transitionTicket(
  deps: KitchenTicketDeps,
  tenantId: string,
  ticketId: string,
  to: KitchenTicketStatus,
  stamp: Partial<Pick<KitchenTicket, "startedAt" | "readyAt" | "completedAt">>,
): Promise<KitchenTicket> {
  const ticket = await loadTicket(deps, tenantId, ticketId);
  assertKitchenTicketTransition(ticket.status, to);
  const now = nowFrom(deps);
  const updated: KitchenTicket = {
    ...ticket,
    status: to,
    revision: ticket.revision + 1,
    updatedAt: now,
    ...stamp,
  };
  await deps.kitchenTickets.save(updated);
  return updated;
}

// POST /v1/kitchen-tickets/:id/start — QUEUED -> IN_PREP; items QUEUED -> IN_PREP.
export async function startKitchenTicket(
  deps: KitchenTicketDeps,
  input: { tenantId: string; ticketId: string; correlationId?: string },
): Promise<KitchenTicket> {
  const now = nowFrom(deps);
  const ticket = await transitionTicket(deps, input.tenantId, input.ticketId, "IN_PREP", { startedAt: now });
  await advanceOrderItems(deps, ticket, "QUEUED", "IN_PREP", now, input.correlationId ?? randomUUID());
  return ticket;
}

// POST /v1/kitchen-tickets/:id/mark-ready — IN_PREP -> READY; items -> READY.
export async function markKitchenTicketReady(
  deps: KitchenTicketDeps,
  input: { tenantId: string; ticketId: string; correlationId?: string },
): Promise<KitchenTicket> {
  const now = nowFrom(deps);
  const ticket = await transitionTicket(deps, input.tenantId, input.ticketId, "READY", { readyAt: now });
  await advanceOrderItems(deps, ticket, "IN_PREP", "READY", now, input.correlationId ?? randomUUID());
  return ticket;
}

// POST /v1/kitchen-tickets/:id/complete — READY -> COMPLETED; items -> DELIVERED.
export async function completeKitchenTicket(
  deps: KitchenTicketDeps,
  input: { tenantId: string; ticketId: string; correlationId?: string },
): Promise<KitchenTicket> {
  const now = nowFrom(deps);
  const ticket = await transitionTicket(deps, input.tenantId, input.ticketId, "COMPLETED", { completedAt: now });
  await advanceOrderItems(deps, ticket, "READY", "DELIVERED", now, input.correlationId ?? randomUUID());
  return ticket;
}

// POST /v1/kitchen-tickets/:id/cancel — compensates production only; the Order
// is not touched (its commercial cancel is a separate command).
export async function cancelKitchenTicket(
  deps: KitchenTicketDeps,
  input: { tenantId: string; ticketId: string },
): Promise<KitchenTicket> {
  return transitionTicket(deps, input.tenantId, input.ticketId, "CANCELLED", {});
}
