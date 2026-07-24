// SPEC-086 — KitchenTicket, the dispatch-to-production aggregate.
//
// PLACEHOLDER NOTE: this is a deliberately BASIC KitchenTicket living inside
// @maitre/ordering because the real Kitchen domain (SPEC-098..110) does not
// exist yet. It is to be SUPERSEDED / ABSORBED by that domain later. Approved
// simplifications vs. SPEC-086:
//   - ONE ticket per Order created at submit time, NOT one per station+routing
//     policy revision (no stationId/routingPolicyRevisionId splitting).
//   - Ticket-level status only (QUEUED|IN_PREP|READY|COMPLETED|CANCELLED) with
//     commands start / mark-ready / complete / cancel — no per-TicketLine state
//     machine, no reprioritize, no station transfer/handoff ownership ledger.
//   - Lines are minimal culinary snapshots (name, quantity, modifier summary,
//     notes) referencing an OrderItem id; no allocations, no fire timing.
//   - Idempotent creation by orderId (there is exactly one per order), not by
//     orderId + orderRevision + stationId.

export type KitchenTicketStatus = "QUEUED" | "IN_PREP" | "READY" | "COMPLETED" | "CANCELLED";

export interface KitchenTicketLine {
  orderItemId: string;
  name: string;
  quantity: number;
  modifiersSummary?: string;
  notes?: string;
}

export interface KitchenTicket {
  id: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  orderId: string;
  orderRevision: number;
  status: KitchenTicketStatus;
  lines: KitchenTicketLine[];
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  readyAt?: Date | null;
  completedAt?: Date | null;
}

const allowedTransitions: Record<KitchenTicketStatus, KitchenTicketStatus[]> = {
  QUEUED: ["IN_PREP", "CANCELLED"],
  IN_PREP: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class InvalidKitchenTicketTransitionError extends Error {
  constructor(from: KitchenTicketStatus, to: KitchenTicketStatus) {
    super(`KitchenTicket cannot transition from ${from} to ${to}`);
    this.name = "InvalidKitchenTicketTransitionError";
  }
}

export function canTransitionKitchenTicket(from: KitchenTicketStatus, to: KitchenTicketStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertKitchenTicketTransition(from: KitchenTicketStatus, to: KitchenTicketStatus): void {
  if (!canTransitionKitchenTicket(from, to)) {
    throw new InvalidKitchenTicketTransitionError(from, to);
  }
}
