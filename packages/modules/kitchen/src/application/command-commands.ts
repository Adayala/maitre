// Command use cases (SPEC-102/104/110) — the real Kitchen state machine driving
// RECEIVED -> CLAIMED -> IN_PROGRESS -> ON_HOLD -> READY -> COMPLETED, plus
// CANCELLED, the CLAIMED -> RECEIVED release, and the exceptional
// READY -> IN_PROGRESS rollback.
//
// Cross-module note: this module stays DECOUPLED from @maitre/ordering. Creating
// Commands at order-submit time and syncing the Order's item statuses back when a
// Command reaches IN_PROGRESS / READY / COMPLETED are both done by the API route
// layer (apps/api/src/routes/kitchen-commands.ts), which owns both containers —
// the same decoupling Ordering used for its Floor/Catalog reads.

import { randomUUID } from "node:crypto";
import {
  type Command,
  type CommandStatus,
  type CommandPayload,
  type TransferRecord,
  assertCommandTransition,
  isCommandTerminal,
} from "../domain/command.js";
import { InvalidStationStateError, isStationActive } from "../domain/station.js";
import type { CommandRepositoryPort, StationRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import {
  commandReceivedEvent,
  commandInProgressEvent,
  commandReadyEvent,
  commandCompletedEvent,
} from "./events.js";

export interface CommandDeps {
  commands: CommandRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadCommand(deps: CommandDeps, tenantId: string, id: string): Promise<Command> {
  const command = await deps.commands.findById(tenantId, id);
  if (!command) throw new Error(`Command ${id} not found`);
  return command;
}

// POST /v1/orders/:id/submit (via the route) — creates one RECEIVED Command per
// OrderItem and emits kitchen.command.received.v1.
export interface CreateCommandInput {
  id?: string;
  tenantId: string;
  brandId: string;
  branchId: string;
  visitId: string;
  orderId: string;
  orderItemId: string;
  stationId: string;
  priority?: number;
  payload: CommandPayload;
  correlationId?: string;
}

export async function createCommand(deps: CommandDeps, input: CreateCommandInput): Promise<Command> {
  const now = nowFrom(deps);
  const command: Command = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    brandId: input.brandId,
    branchId: input.branchId,
    visitId: input.visitId,
    orderId: input.orderId,
    orderItemId: input.orderItemId,
    stationId: input.stationId,
    status: "RECEIVED",
    priority: input.priority ?? 0,
    ownerActorRef: null,
    payload: input.payload,
    cancelReason: null,
    transferHistory: [],
    revision: 1,
    receivedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await deps.commands.save(command);
  await deps.outbox.append(commandReceivedEvent(command, input.correlationId ?? randomUUID()));
  return command;
}

// Shared transition helper: asserts the SPEC-110 edge, bumps revision, stamps
// timestamps, persists, and returns the updated Command.
async function transition(
  deps: CommandDeps,
  command: Command,
  to: CommandStatus,
  patch: Partial<Command>,
  transitionedAt = nowFrom(deps),
): Promise<Command> {
  assertCommandTransition(command.status, to);
  const updated: Command = {
    ...command,
    ...patch,
    status: to,
    revision: command.revision + 1,
    updatedAt: transitionedAt,
  };
  await deps.commands.save(updated);
  return updated;
}

// POST /claim — RECEIVED -> CLAIMED, fixes owner.
export async function claimCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; actorRef: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  const now = nowFrom(deps);
  return transition(deps, command, "CLAIMED", { ownerActorRef: input.actorRef, claimedAt: now }, now);
}

// POST /release — CLAIMED -> RECEIVED (only before production begins), clears owner.
export async function releaseCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  return transition(deps, command, "RECEIVED", { ownerActorRef: null, claimedAt: null });
}

// POST /start — CLAIMED -> IN_PROGRESS. Emits kitchen.command.in-progress.v1 ONCE
// here (not on claim, not on resume).
export async function startCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; correlationId?: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  const now = nowFrom(deps);
  const updated = await transition(deps, command, "IN_PROGRESS", { startedAt: now }, now);
  await deps.outbox.append(commandInProgressEvent(updated, now, input.correlationId ?? randomUUID()));
  return updated;
}

// POST /hold — IN_PROGRESS -> ON_HOLD.
export async function holdCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  return transition(deps, command, "ON_HOLD", {});
}

// POST /resume — ON_HOLD -> IN_PROGRESS. No in-progress event (already emitted at
// first start — the spec's "once per logical transition when production begins").
export async function resumeCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  return transition(deps, command, "IN_PROGRESS", {});
}

// POST /mark-ready — IN_PROGRESS -> READY. Emits kitchen.command.ready.v1.
export async function markCommandReady(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; correlationId?: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  const now = nowFrom(deps);
  const updated = await transition(deps, command, "READY", { readyAt: now }, now);
  await deps.outbox.append(commandReadyEvent(updated, now, input.correlationId ?? randomUUID()));
  return updated;
}

// POST /complete-handoff — READY -> COMPLETED. Emits kitchen.command.completed.v1.
export async function completeCommandHandoff(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; correlationId?: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  const now = nowFrom(deps);
  const updated = await transition(deps, command, "COMPLETED", { completedAt: now }, now);
  await deps.outbox.append(commandCompletedEvent(updated, now, input.correlationId ?? randomUUID()));
  return updated;
}

// POST /rollback — exceptional READY -> IN_PROGRESS. Requires a reason (the
// manager tier is gated by the route's normal RBAC permission; no extra
// permission-tier check per the approved scope). Re-opens production without a
// new in-progress event (it was already emitted).
export async function rollbackCommandToInProgress(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; reason: string },
): Promise<Command> {
  if (!input.reason || input.reason.trim().length === 0) {
    throw new InvalidStationStateError("READY -> IN_PROGRESS rollback requires a reason");
  }
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  return transition(deps, command, "IN_PROGRESS", { readyAt: null });
}

// POST /cancel — -> CANCELLED from any non-terminal state, records reasonCode.
// Cancel after IN_PROGRESS is production-only compensation (the Order's
// commercial state is governed separately); it never deletes history.
export async function cancelCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; reason: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  const now = nowFrom(deps);
  return transition(deps, command, "CANCELLED", { cancelReason: input.reason, cancelledAt: now }, now);
}

export class CommandTerminalError extends InvalidStationStateError {
  constructor(id: string, status: CommandStatus) {
    super(`Command ${id} is ${status} and cannot be transferred`);
    this.name = "CommandTerminalError";
  }
}

export class StationNotRoutableError extends InvalidStationStateError {
  constructor(message: string) {
    super(message);
    this.name = "StationNotRoutableError";
  }
}

// POST /transfer — moves a non-terminal Command to another ACTIVE Station in the
// same tenant/branch, preserving status + identity, appending a TransferRecord.
export interface TransferCommandDeps extends CommandDeps {
  stations: StationRepositoryPort;
}

export async function transferCommand(
  deps: TransferCommandDeps,
  input: { tenantId: string; commandId: string; targetStationId: string; reason: string; actor?: string },
): Promise<Command> {
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  if (isCommandTerminal(command)) throw new CommandTerminalError(command.id, command.status);
  if (input.targetStationId === command.stationId) {
    throw new StationNotRoutableError(`Command ${command.id} is already at station ${input.targetStationId}`);
  }
  const target = await deps.stations.findById(input.tenantId, input.targetStationId);
  if (!target) throw new StationNotRoutableError(`Target station ${input.targetStationId} not found`);
  if (target.branchId !== command.branchId) {
    throw new StationNotRoutableError(`Target station ${target.id} is in a different branch`);
  }
  if (!isStationActive(target)) throw new StationNotRoutableError(`Target station ${target.id} is not ACTIVE`);

  const now = nowFrom(deps);
  const record: TransferRecord = {
    fromStationId: command.stationId,
    toStationId: target.id,
    reason: input.reason,
    at: now,
    ...(input.actor ? { actor: input.actor } : {}),
  };
  const updated: Command = {
    ...command,
    stationId: target.id,
    transferHistory: [...command.transferHistory, record],
    revision: command.revision + 1,
    updatedAt: now,
  };
  await deps.commands.save(updated);
  return updated;
}

// POST /reprioritize — direct write to the priority integer with a required
// reason (a policy-versioned reprioritization with expiry is deferred).
export async function reprioritizeCommand(
  deps: CommandDeps,
  input: { tenantId: string; commandId: string; priority: number; reason: string },
): Promise<Command> {
  if (!input.reason || input.reason.trim().length === 0) {
    throw new InvalidStationStateError("reprioritize requires a reason");
  }
  const command = await loadCommand(deps, input.tenantId, input.commandId);
  if (isCommandTerminal(command)) throw new CommandTerminalError(command.id, command.status);
  const now = nowFrom(deps);
  const updated: Command = {
    ...command,
    priority: input.priority,
    revision: command.revision + 1,
    updatedAt: now,
  };
  await deps.commands.save(updated);
  return updated;
}
