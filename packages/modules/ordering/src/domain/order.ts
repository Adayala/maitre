// SPEC-081 — Order, the commercial aggregate of a Visit. Groups OrderItem
// snapshots, commercial totals and an audit trail of OrderAdjustments.
//
// SCOPE NOTE (approved simplification vs. SPEC-081's "never write fulfillment
// directly, always derive" model): Order stores an EXPLICIT `status` field
// (DRAFT | SUBMITTED | IN_PREP | READY | PARTIALLY_DELIVERED | DELIVERED |
// CANCELLED). It is not computed on read; instead each use case that moves an
// OrderItem re-runs deriveOrderStatus() over the items and persists the result.
// The derivation precedence itself is the one SPEC-081 mandates, so the stored
// value always equals what a pure projection would compute — we just persist it
// rather than recomputing on every read.
//
// Also deferred (documented): the transactional submit saga with
// 409 CATALOG_CHANGED revalidation diffs (catalog is revalidated by the route
// layer, not diffed here), If-Match/Idempotency-Key enforcement (consistent
// with Floor/Reservations precedent), tax engine (taxTotal is always 0 — no
// TaxPolicy exists), and brandId linkage (Visit carries no brand, so Order
// omits brandId; events emit branchId only, matching Floor's VisitOpened).

import {
  type OrderItem,
  orderItemLineTotal,
  isOrderItemTerminal,
} from "./order-item.js";

export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_PREP"
  | "READY"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

// Simple audit sub-record recorded whenever items are added/cancelled/
// quantity-changed after submit. NOT the full SPEC-089 saga (no PENDING/
// APPLIED/REJECTED/COMPENSATION_REQUIRED states, no Kitchen/Check coordination
// step) — the change is applied synchronously and this record captures it.
export interface OrderAdjustment {
  id: string;
  reasonCode: string;
  actorType: string;
  deltaAmountMinorUnits: number; // signed: negative reduces the order total
  orderItemId?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  currency: string;
  items: OrderItem[];
  adjustments: OrderAdjustment[];
  status: OrderStatus;
  catalogRevisionId?: string;
  notes?: string;
  subtotalMinorUnits: number;
  taxTotalMinorUnits: number;
  grandTotalMinorUnits: number;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date | null;
  cancelledAt?: Date | null;
}

export interface OrderTotals {
  subtotalMinorUnits: number;
  taxTotalMinorUnits: number;
  grandTotalMinorUnits: number;
}

// Subtotal = sum of non-cancelled item line totals. taxTotal is always 0
// (deferred — no TaxPolicy/tax engine, same gap Floor's Check documents).
export function computeOrderTotals(items: OrderItem[]): OrderTotals {
  const subtotal = items
    .filter((i) => i.status !== "CANCELLED")
    .reduce((sum, i) => sum + orderItemLineTotal(i), 0);
  return {
    subtotalMinorUnits: subtotal,
    taxTotalMinorUnits: 0,
    grandTotalMinorUnits: subtotal,
  };
}

// SPEC-081 derivation precedence, applied to a SUBMITTED order's items:
// all cancelled -> CANCELLED; all terminal with >=1 delivered -> DELIVERED;
// any delivered -> PARTIALLY_DELIVERED; all non-cancelled ready -> READY;
// any item in production/ready -> IN_PREP; otherwise SUBMITTED.
export function deriveOrderStatus(items: OrderItem[]): OrderStatus {
  if (items.length === 0) return "SUBMITTED";
  const nonCancelled = items.filter((i) => i.status !== "CANCELLED");
  if (nonCancelled.length === 0) return "CANCELLED";

  const allTerminal = items.every(isOrderItemTerminal);
  const anyDelivered = items.some((i) => i.status === "DELIVERED");
  if (allTerminal && anyDelivered) return "DELIVERED";
  if (anyDelivered) return "PARTIALLY_DELIVERED";

  if (nonCancelled.every((i) => i.status === "READY")) return "READY";
  if (nonCancelled.some((i) => i.status === "IN_PREP" || i.status === "READY")) return "IN_PREP";
  return "SUBMITTED";
}

export class InvalidOrderStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderStateError";
  }
}

export function assertOrderDraft(order: Order): void {
  if (order.status !== "DRAFT") {
    throw new InvalidOrderStateError(`Order ${order.id} is ${order.status}, expected DRAFT`);
  }
}

export function assertOrderSubmitted(order: Order): void {
  if (order.status === "DRAFT" || order.status === "CANCELLED") {
    throw new InvalidOrderStateError(`Order ${order.id} is ${order.status}, expected a submitted state`);
  }
}
