import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionCommand,
  assertCommandTransition,
  InvalidCommandTransitionError,
  type CommandStatus,
} from "../domain/command.js";
import { FakeCommandRepository, FakeStationRepository, FakeOutboxRepository } from "./fakes.js";
import {
  createCommand,
  claimCommand,
  releaseCommand,
  startCommand,
  holdCommand,
  resumeCommand,
  markCommandReady,
  completeCommandHandoff,
  cancelCommand,
  rollbackCommandToInProgress,
  transferCommand,
  reprioritizeCommand,
  CommandTerminalError,
  StationNotRoutableError,
} from "../application/command-commands.js";
import { createStation } from "../application/station-commands.js";

function deps() {
  return { commands: new FakeCommandRepository(), outbox: new FakeOutboxRepository() };
}

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: "t1",
    brandId: "br1",
    branchId: "b1",
    visitId: "v1",
    orderId: "o1",
    orderItemId: "oi1",
    stationId: "s1",
    payload: { displayName: "Empanada", quantity: 1, allergenFlags: [] },
    ...overrides,
  };
}

// SPEC-110 authoritative transition table (valid + invalid edges).
const validEdges: [CommandStatus, CommandStatus][] = [
  ["RECEIVED", "CLAIMED"],
  ["RECEIVED", "CANCELLED"],
  ["CLAIMED", "IN_PROGRESS"],
  ["CLAIMED", "RECEIVED"],
  ["CLAIMED", "CANCELLED"],
  ["IN_PROGRESS", "ON_HOLD"],
  ["IN_PROGRESS", "READY"],
  ["IN_PROGRESS", "CANCELLED"],
  ["ON_HOLD", "IN_PROGRESS"],
  ["ON_HOLD", "CANCELLED"],
  ["READY", "COMPLETED"],
  ["READY", "IN_PROGRESS"],
];

const invalidEdges: [CommandStatus, CommandStatus][] = [
  ["RECEIVED", "IN_PROGRESS"],
  ["RECEIVED", "READY"],
  ["RECEIVED", "COMPLETED"],
  ["CLAIMED", "READY"],
  ["CLAIMED", "COMPLETED"],
  ["IN_PROGRESS", "COMPLETED"],
  ["IN_PROGRESS", "CLAIMED"],
  ["ON_HOLD", "READY"],
  ["ON_HOLD", "COMPLETED"],
  ["READY", "CANCELLED"],
  ["READY", "ON_HOLD"],
  ["COMPLETED", "IN_PROGRESS"],
  ["COMPLETED", "CANCELLED"],
  ["CANCELLED", "RECEIVED"],
  ["CANCELLED", "CLAIMED"],
];

test("state machine table: valid edges pass, invalid edges throw", () => {
  for (const [from, to] of validEdges) {
    assert.equal(canTransitionCommand(from, to), true, `${from} -> ${to} should be valid`);
    assert.doesNotThrow(() => assertCommandTransition(from, to));
  }
  for (const [from, to] of invalidEdges) {
    assert.equal(canTransitionCommand(from, to), false, `${from} -> ${to} should be invalid`);
    assert.throws(() => assertCommandTransition(from, to), InvalidCommandTransitionError);
  }
});

test("create emits received event and starts in RECEIVED", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  assert.equal(command.status, "RECEIVED");
  assert.equal(d.outbox.records.at(-1)?.eventName, "kitchen.command.received.v1");
});

test("claim sets owner; release clears it", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  const claimed = await claimCommand(d, { tenantId: "t1", commandId: command.id, actorRef: "cook-42" });
  assert.equal(claimed.status, "CLAIMED");
  assert.equal(claimed.ownerActorRef, "cook-42");
  const released = await releaseCommand(d, { tenantId: "t1", commandId: command.id });
  assert.equal(released.status, "RECEIVED");
  assert.equal(released.ownerActorRef, null);
});

test("in-progress event fires only on start, not on claim nor resume", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  await claimCommand(d, { tenantId: "t1", commandId: command.id, actorRef: "cook" });
  assert.equal(d.outbox.records.filter((r) => r.eventName === "kitchen.command.in-progress.v1").length, 0);

  await startCommand(d, { tenantId: "t1", commandId: command.id });
  await holdCommand(d, { tenantId: "t1", commandId: command.id });
  await resumeCommand(d, { tenantId: "t1", commandId: command.id });
  assert.equal(d.outbox.records.filter((r) => r.eventName === "kitchen.command.in-progress.v1").length, 1);
});

test("full happy path RECEIVED->...->COMPLETED emits ready + completed", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  await claimCommand(d, { tenantId: "t1", commandId: command.id, actorRef: "cook" });
  await startCommand(d, { tenantId: "t1", commandId: command.id });
  const ready = await markCommandReady(d, { tenantId: "t1", commandId: command.id });
  assert.equal(ready.status, "READY");
  const done = await completeCommandHandoff(d, { tenantId: "t1", commandId: command.id });
  assert.equal(done.status, "COMPLETED");
  const names = d.outbox.records.map((r) => r.eventName);
  assert.ok(names.includes("kitchen.command.ready.v1"));
  assert.ok(names.includes("kitchen.command.completed.v1"));
});

test("cannot skip states (RECEIVED -> READY throws)", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  await assert.rejects(
    () => markCommandReady(d, { tenantId: "t1", commandId: command.id }),
    InvalidCommandTransitionError,
  );
});

test("rollback READY -> IN_PROGRESS requires a reason", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  await claimCommand(d, { tenantId: "t1", commandId: command.id, actorRef: "c" });
  await startCommand(d, { tenantId: "t1", commandId: command.id });
  await markCommandReady(d, { tenantId: "t1", commandId: command.id });
  await assert.rejects(() => rollbackCommandToInProgress(d, { tenantId: "t1", commandId: command.id, reason: "" }));
  const rolled = await rollbackCommandToInProgress(d, { tenantId: "t1", commandId: command.id, reason: "wrong plate" });
  assert.equal(rolled.status, "IN_PROGRESS");
});

test("cancel records reason and is terminal", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  await claimCommand(d, { tenantId: "t1", commandId: command.id, actorRef: "c" });
  await startCommand(d, { tenantId: "t1", commandId: command.id });
  const cancelled = await cancelCommand(d, { tenantId: "t1", commandId: command.id, reason: "86_INGREDIENT" });
  assert.equal(cancelled.status, "CANCELLED");
  assert.equal(cancelled.cancelReason, "86_INGREDIENT");
  await assert.rejects(() => startCommand(d, { tenantId: "t1", commandId: command.id }), InvalidCommandTransitionError);
});

test("transfer moves station, appends history, rejects terminal/inactive targets", async () => {
  const stations = new FakeStationRepository();
  const d = { ...deps(), stations };
  await createStation({ stations }, { id: "s1", tenantId: "t1", brandId: "br1", branchId: "b1", code: "GRILL", displayName: "Grill" });
  await createStation({ stations }, { id: "s2", tenantId: "t1", brandId: "br1", branchId: "b1", code: "FRY", displayName: "Fry" });

  const command = await createCommand(d, baseInput());
  const transferred = await transferCommand(d, {
    tenantId: "t1",
    commandId: command.id,
    targetStationId: "s2",
    reason: "load balance",
    actor: "maitre",
  });
  assert.equal(transferred.stationId, "s2");
  assert.equal(transferred.transferHistory.length, 1);
  assert.equal(transferred.transferHistory[0]?.fromStationId, "s1");

  // Unknown target station -> not routable.
  await assert.rejects(
    () => transferCommand(d, { tenantId: "t1", commandId: command.id, targetStationId: "nope", reason: "x" }),
    StationNotRoutableError,
  );

  // Terminal command cannot be transferred.
  await cancelCommand(d, { tenantId: "t1", commandId: command.id, reason: "done" });
  await assert.rejects(
    () => transferCommand(d, { tenantId: "t1", commandId: command.id, targetStationId: "s1", reason: "x" }),
    CommandTerminalError,
  );
});

test("reprioritize changes priority with a required reason", async () => {
  const d = deps();
  const command = await createCommand(d, baseInput());
  assert.equal(command.priority, 0);
  await assert.rejects(() => reprioritizeCommand(d, { tenantId: "t1", commandId: command.id, priority: 5, reason: "" }));
  const bumped = await reprioritizeCommand(d, { tenantId: "t1", commandId: command.id, priority: 5, reason: "VIP" });
  assert.equal(bumped.priority, 5);
});
