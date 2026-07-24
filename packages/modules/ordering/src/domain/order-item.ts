// SPEC-082 — OrderItem, the unit of fulfillment. Stored as a JSONB element of
// the Order aggregate (see order.ts) rather than a separate table/repo,
// mirroring the established Floor Check precedent where lines/adjustments are
// embedded JSONB arrays on the Check row.
//
// SCOPE NOTE (approved simplification): one item carries ONE status — there is
// no partial-quantity allocation/sub-unit model (SPEC-082's "allocations cuya
// suma conserva la quantity original"). Partial fulfillment and per-allocation
// transitions are deferred; a cancel always cancels the whole remaining item.
// The frozen snapshot (name, price, currency, modifiers, allergens) is captured
// at add/submit time from Catalog data resolved by the route layer, and is
// never repriced afterwards — a post-submit change produces an OrderAdjustment
// (see order.ts), never an in-place snapshot rewrite.

import { type OrderModifier, modifierDeltaTotal } from "./order-modifier.js";

export type OrderItemStatus = "QUEUED" | "IN_PREP" | "READY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  catalogRevisionId?: string;
  name: string;
  quantity: number;
  unitPriceMinorUnits: number;
  currency: string;
  modifiers: OrderModifier[];
  allergens: string[];
  notes?: string;
  status: OrderItemStatus;
  cancelReason?: string;
  cancelledAt?: Date | null;
}

// Monotonic operational transitions per SPEC-082: QUEUED -> IN_PREP -> READY ->
// DELIVERED, and QUEUED|IN_PREP|READY -> CANCELLED. Terminal states never move.
const allowedTransitions: Record<OrderItemStatus, OrderItemStatus[]> = {
  QUEUED: ["IN_PREP", "READY", "CANCELLED"],
  IN_PREP: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export class InvalidOrderItemTransitionError extends Error {
  constructor(from: OrderItemStatus, to: OrderItemStatus) {
    super(`OrderItem cannot transition from ${from} to ${to}`);
    this.name = "InvalidOrderItemTransitionError";
  }
}

export function canTransitionOrderItem(from: OrderItemStatus, to: OrderItemStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertOrderItemTransition(from: OrderItemStatus, to: OrderItemStatus): void {
  if (!canTransitionOrderItem(from, to)) {
    throw new InvalidOrderItemTransitionError(from, to);
  }
}

export function isOrderItemTerminal(item: OrderItem): boolean {
  return item.status === "DELIVERED" || item.status === "CANCELLED";
}

export class InvalidQuantityError extends Error {
  constructor(quantity: number) {
    super(`Quantity ${quantity} must be a positive integer`);
    this.name = "InvalidQuantityError";
  }
}

export function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
}

// Exact money, minor units (SPEC-215): (unit price + sum of modifier deltas) * qty.
export function orderItemLineTotal(item: OrderItem): number {
  const modifiersDelta = item.modifiers.reduce((sum, m) => sum + modifierDeltaTotal(m), 0);
  return (item.unitPriceMinorUnits + modifiersDelta) * item.quantity;
}
