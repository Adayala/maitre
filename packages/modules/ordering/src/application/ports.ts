import type { Order } from "../domain/order.js";
import type { CapabilityToken } from "../domain/capability-token.js";
import type { KitchenTicket } from "../domain/kitchen-ticket.js";
import type { SpecialRequest } from "../domain/special-request.js";

// Order embeds its OrderItems (and their modifiers/adjustments) as JSONB, so
// there is a single Order repository — no separate OrderItem repo/table,
// matching the Floor Check(lines/adjustments) precedent (documented in
// order-item.ts).
export interface OrderRepositoryPort {
  findById(tenantId: string, id: string): Promise<Order | null>;
  listByVisit(tenantId: string, visitId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
}

// One repo for all three capability purposes (MENU_READ / BILL_READ /
// ORDER_TRACK_READ), discriminated by `purpose`. Resolution is by token hash
// and is intentionally tenant-agnostic (public callers present no tenant) — the
// 256-bit hash is globally unique.
export interface CapabilityTokenRepositoryPort {
  findById(tenantId: string, id: string): Promise<CapabilityToken | null>;
  findByHash(tokenHash: string): Promise<CapabilityToken | null>;
  save(token: CapabilityToken): Promise<void>;
}

export interface KitchenTicketRepositoryPort {
  findById(tenantId: string, id: string): Promise<KitchenTicket | null>;
  findByOrder(tenantId: string, orderId: string): Promise<KitchenTicket | null>;
  listByBranch(tenantId: string, branchId: string): Promise<KitchenTicket[]>;
  save(ticket: KitchenTicket): Promise<void>;
}

export interface SpecialRequestRepositoryPort {
  findById(tenantId: string, id: string): Promise<SpecialRequest | null>;
  listByTarget(tenantId: string, targetType: string, targetId: string): Promise<SpecialRequest[]>;
  save(request: SpecialRequest): Promise<void>;
}
