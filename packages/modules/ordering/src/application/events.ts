// SPEC-094/095/096 — Ordering outbox events. Envelope shape mirrors
// @maitre/floor's events.ts.
//
// SCOPE NOTE (deferred, documented): only the aggregate-level facts are
// emitted — ordering.order.submitted.v1, ordering.order.ready.v1 and
// ordering.order.delivered.v1. The granular per-item/per-allocation events
// (ordering.order-item.ready.v1, ordering.order-item.delivered.v1) are NOT
// emitted because the item model carries no allocations (see order-item.ts).
// Payloads omit PII, free-text notes, textual modifiers and per-item pricing,
// per SPEC-094 §payload mínimo.

import { randomUUID } from "node:crypto";
import type { Order } from "../domain/order.js";
import type { OutboxRecord } from "./outbox.js";

function record<T>(
  eventName: string,
  aggregateType: string,
  aggregateId: string,
  tenantId: string,
  correlationId: string,
  occurredAt: Date,
  payload: T,
): OutboxRecord<T> {
  return {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    occurredAt,
    producer: "ordering",
    tenantId,
    aggregateType,
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

// SPEC-094 — ordering.order.submitted.v1 (the `OrderPlaced` legacy name is not
// publishable). Emitted once when submit freezes the snapshot and creates the
// production dispatch (KitchenTicket).
export interface OrderSubmittedPayload {
  orderId: string;
  visitId: string;
  branchId: string;
  catalogRevisionId?: string;
  aggregateRevision: number;
  submittedAt: Date;
  currency: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}

export function orderSubmittedEvent(order: Order, correlationId: string): OutboxRecord<OrderSubmittedPayload> {
  return record(
    "ordering.order.submitted.v1",
    "Order",
    order.id,
    order.tenantId,
    correlationId,
    order.submittedAt ?? new Date(),
    {
      orderId: order.id,
      visitId: order.visitId,
      branchId: order.branchId,
      aggregateRevision: order.revision,
      submittedAt: order.submittedAt ?? new Date(),
      currency: order.currency,
      subtotal: order.subtotalMinorUnits,
      taxTotal: order.taxTotalMinorUnits,
      grandTotal: order.grandTotalMinorUnits,
      ...(order.catalogRevisionId ? { catalogRevisionId: order.catalogRevisionId } : {}),
    },
  );
}

// SPEC-095 — ordering.order.ready.v1, emitted only when the aggregate derivation
// changes to READY.
export interface OrderReadyPayload {
  orderId: string;
  visitId: string;
  branchId: string;
  aggregateRevision: number;
  readyAt: Date;
}

export function orderReadyEvent(order: Order, readyAt: Date, correlationId: string): OutboxRecord<OrderReadyPayload> {
  return record("ordering.order.ready.v1", "Order", order.id, order.tenantId, correlationId, readyAt, {
    orderId: order.id,
    visitId: order.visitId,
    branchId: order.branchId,
    aggregateRevision: order.revision,
    readyAt,
  });
}

// SPEC-096 — ordering.order.delivered.v1, emitted only when the aggregate
// derivation changes to DELIVERED. Does not close Check nor capture payment.
export interface OrderDeliveredPayload {
  orderId: string;
  visitId: string;
  branchId: string;
  aggregateRevision: number;
  deliveredAt: Date;
}

export function orderDeliveredEvent(
  order: Order,
  deliveredAt: Date,
  correlationId: string,
): OutboxRecord<OrderDeliveredPayload> {
  return record("ordering.order.delivered.v1", "Order", order.id, order.tenantId, correlationId, deliveredAt, {
    orderId: order.id,
    visitId: order.visitId,
    branchId: order.branchId,
    aggregateRevision: order.revision,
    deliveredAt,
  });
}
