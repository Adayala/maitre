// SPEC-098 / SPEC-110 — Command, the authoritative unit of culinary work. One
// Command exists per OrderItem (NOT per allocation — the Ordering domain itself
// defers the allocation model, see order-item.ts), routed to one Station.
//
// This is the REAL replacement for Ordering's placeholder KitchenTicket: it
// implements the full SPEC-110 state machine below.
//
// SCOPE NOTE (approved simplifications, documented):
//   - payload carries SIMPLE typed fields (displayName, quantity, modifierSummary,
//     notes capped, allergenFlags) — NOT a discriminated union keyed by
//     commandType + schemaVersion. No blobs/PII/prices.
//   - Technical errors are NOT tracked as separate retryable attempts: a
//     transition that violates a precondition simply throws a normal error. No
//     attempt/retry ledger.
//   - Transfer updates stationId and appends a simple TransferRecord to
//     transferHistory; there is no "atomic ownership dual-check" beyond refusing
//     to transfer a terminal (COMPLETED/CANCELLED) Command.
//   - reprioritize is a direct write to the `priority` integer (with a reason
//     kept on the transfer/adjustment audit trail via the queue command), NOT a
//     policy-versioned reprioritization event with expiry.
//   - No expected-revision / If-Match / idempotency-key enforcement (consistent
//     with every prior Fase 2 domain).

export type CommandStatus =
  | "RECEIVED"
  | "CLAIMED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

// Simple, typed, allowlisted culinary payload (SPEC-098 §payload, simplified).
export interface CommandPayload {
  displayName: string;
  quantity: number;
  modifierSummary?: string;
  notes?: string;
  allergenFlags: string[];
}

// Audit sub-record appended whenever a Command is transferred to another Station.
export interface TransferRecord {
  fromStationId: string;
  toStationId: string;
  reason: string;
  actor?: string;
  at: Date;
}

export interface Command {
  id: string;
  tenantId: string;
  brandId: string;
  branchId: string;
  visitId: string;
  orderId: string;
  orderItemId: string;
  stationId: string;
  status: CommandStatus;
  priority: number;
  ownerActorRef?: string | null;
  payload: CommandPayload;
  cancelReason?: string | null;
  transferHistory: TransferRecord[];
  revision: number;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  claimedAt?: Date | null;
  startedAt?: Date | null;
  readyAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
}

// SPEC-110 authoritative transition table:
//   RECEIVED    -> CLAIMED | CANCELLED
//   CLAIMED     -> IN_PROGRESS | RECEIVED (release) | CANCELLED
//   IN_PROGRESS -> ON_HOLD | READY | CANCELLED
//   ON_HOLD     -> IN_PROGRESS | CANCELLED
//   READY       -> COMPLETED | IN_PROGRESS (exceptional rollback, manager+reason)
//   COMPLETED / CANCELLED are terminal.
const allowedTransitions: Record<CommandStatus, CommandStatus[]> = {
  RECEIVED: ["CLAIMED", "CANCELLED"],
  CLAIMED: ["IN_PROGRESS", "RECEIVED", "CANCELLED"],
  IN_PROGRESS: ["ON_HOLD", "READY", "CANCELLED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED"],
  READY: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: [],
  CANCELLED: [],
};

// Non-terminal states appear in the ProductionQueue projection.
export const NON_TERMINAL_STATUSES: readonly CommandStatus[] = [
  "RECEIVED",
  "CLAIMED",
  "IN_PROGRESS",
  "ON_HOLD",
  "READY",
];

export class InvalidCommandTransitionError extends Error {
  constructor(from: CommandStatus, to: CommandStatus) {
    super(`Command cannot transition from ${from} to ${to}`);
    this.name = "InvalidCommandTransitionError";
  }
}

export function canTransitionCommand(from: CommandStatus, to: CommandStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertCommandTransition(from: CommandStatus, to: CommandStatus): void {
  if (!canTransitionCommand(from, to)) {
    throw new InvalidCommandTransitionError(from, to);
  }
}

export function isCommandTerminal(command: Command): boolean {
  return command.status === "COMPLETED" || command.status === "CANCELLED";
}
