import { test } from "node:test";
import assert from "node:assert/strict";
import { FakeStationRepository, FakeCommandRepository, FakeKitchenAlertRepository, FakeOutboxRepository } from "./fakes.js";
import {
  createStation,
  updateStation,
  deactivateStation,
  activateStation,
  StationHasActiveCommandsError,
} from "../application/station-commands.js";
import { DuplicateStationCodeError } from "../domain/station.js";
import { createCommand, reprioritizeCommand } from "../application/command-commands.js";
import { getProductionQueue } from "../application/production-queue.js";
import {
  createAlertIfNotDuplicate,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  evaluateAndRaiseAlerts,
} from "../application/alert-commands.js";
import { InvalidAlertTransitionError } from "../domain/kitchen-alert.js";
import { RULE_STALE_BEFORE_START } from "../application/alert-rules.js";

function stationInput(overrides: Record<string, unknown> = {}) {
  return { tenantId: "t1", brandId: "br1", branchId: "b1", code: "GRILL", displayName: "Grill", ...overrides };
}

test("station code is unique per branch", async () => {
  const stations = new FakeStationRepository();
  await createStation({ stations }, stationInput());
  await assert.rejects(() => createStation({ stations }, stationInput()), DuplicateStationCodeError);
  // Same code, different branch -> allowed.
  await assert.doesNotReject(() => createStation({ stations }, stationInput({ branchId: "b2" })));
});

test("update mutates fields and bumps revision", async () => {
  const stations = new FakeStationRepository();
  const s = await createStation({ stations }, stationInput());
  const updated = await updateStation({ stations }, { tenantId: "t1", id: s.id, displayName: "Grill Station", capabilities: ["GRILL"] });
  assert.equal(updated.displayName, "Grill Station");
  assert.deepEqual(updated.capabilities, ["GRILL"]);
  assert.equal(updated.revision, 2);
});

test("deactivate refused while non-terminal commands exist", async () => {
  const stations = new FakeStationRepository();
  const commands = new FakeCommandRepository();
  const outbox = new FakeOutboxRepository();
  const s = await createStation({ stations }, stationInput({ id: "s1" }));
  await createCommand(
    { commands, outbox },
    {
      tenantId: "t1",
      brandId: "br1",
      branchId: "b1",
      visitId: "v1",
      orderId: "o1",
      orderItemId: "oi1",
      stationId: s.id,
      payload: { displayName: "X", quantity: 1, allergenFlags: [] },
    },
  );
  await assert.rejects(
    () => deactivateStation({ stations, commands }, { tenantId: "t1", id: s.id }),
    StationHasActiveCommandsError,
  );
});

test("firstActiveByBranch honours displayOrder then code", async () => {
  const stations = new FakeStationRepository();
  await createStation({ stations }, stationInput({ id: "s1", code: "GRILL", displayOrder: 2 }));
  await createStation({ stations }, stationInput({ id: "s2", code: "FRY", displayOrder: 1 }));
  const first = await stations.firstActiveByBranch("t1", "b1");
  assert.equal(first?.id, "s2");
  await deactivateStation({ stations, commands: new FakeCommandRepository() }, { tenantId: "t1", id: "s2" });
  const next = await stations.firstActiveByBranch("t1", "b1");
  assert.equal(next?.id, "s1");
  await activateStation({ stations }, { tenantId: "t1", id: "s2" });
});

test("production queue orders by priority DESC, receivedAt ASC, id ASC", async () => {
  const commands = new FakeCommandRepository();
  const outbox = new FakeOutboxRepository();
  const base = new Date("2026-07-25T10:00:00Z");
  const mk = (id: string, at: Date) =>
    createCommand(
      { commands, outbox, now: () => at },
      {
        id,
        tenantId: "t1",
        brandId: "br1",
        branchId: "b1",
        visitId: "v1",
        orderId: "o1",
        orderItemId: id,
        stationId: "s1",
        payload: { displayName: id, quantity: 1, allergenFlags: [] },
      },
    );
  await mk("aaa", new Date(base.getTime() + 2000));
  await mk("bbb", new Date(base.getTime() + 1000));
  await mk("ccc", new Date(base.getTime() + 1000));
  // Bump ccc's priority so it jumps ahead despite later arrival tiebreak.
  await reprioritizeCommand({ commands, outbox }, { tenantId: "t1", commandId: "ccc", priority: 10, reason: "VIP" });

  const queue = await getProductionQueue({ commands }, { tenantId: "t1", stationId: "s1" });
  assert.equal(queue.stationId, "s1");
  assert.deepEqual(queue.commands.map((c) => c.id), ["ccc", "bbb", "aaa"]);
  assert.ok(queue.asOf instanceof Date);
});

test("alert dedup: no second OPEN alert for same command+rule", async () => {
  const alerts = new FakeKitchenAlertRepository();
  const first = await createAlertIfNotDuplicate(
    { alerts },
    { tenantId: "t1", branchId: "b1", commandId: "c1", ruleCode: RULE_STALE_BEFORE_START, severity: "MEDIUM" },
  );
  const second = await createAlertIfNotDuplicate(
    { alerts },
    { tenantId: "t1", branchId: "b1", commandId: "c1", ruleCode: RULE_STALE_BEFORE_START, severity: "MEDIUM" },
  );
  assert.equal(first.id, second.id);
  const list = await alerts.listByBranch("t1", "b1");
  assert.equal(list.length, 1);
});

test("alert lifecycle: acknowledge -> resolve, escalate raises level", async () => {
  const alerts = new FakeKitchenAlertRepository();
  const a = await createAlertIfNotDuplicate(
    { alerts },
    { tenantId: "t1", branchId: "b1", commandId: "c1", ruleCode: "R", severity: "HIGH" },
  );
  const ack = await acknowledgeAlert({ alerts }, { tenantId: "t1", id: a.id });
  assert.equal(ack.status, "ACKNOWLEDGED");
  const esc = await escalateAlert({ alerts }, { tenantId: "t1", id: a.id });
  assert.equal(esc.status, "ESCALATED");
  assert.equal(esc.escalationLevel, 1);
  const resolved = await resolveAlert({ alerts }, { tenantId: "t1", id: a.id, reasonCode: "HANDLED" });
  assert.equal(resolved.status, "RESOLVED");
  assert.equal(resolved.resolutionReason, "HANDLED");
  // RESOLVED is terminal.
  await assert.rejects(() => acknowledgeAlert({ alerts }, { tenantId: "t1", id: a.id }), InvalidAlertTransitionError);
});

test("evaluateAndRaiseAlerts raises a stale-before-start alert past threshold", async () => {
  const commands = new FakeCommandRepository();
  const outbox = new FakeOutboxRepository();
  const alerts = new FakeKitchenAlertRepository();
  const received = new Date("2026-07-25T10:00:00Z");
  await createCommand(
    { commands, outbox, now: () => received },
    {
      tenantId: "t1",
      brandId: "br1",
      branchId: "b1",
      visitId: "v1",
      orderId: "o1",
      orderItemId: "oi1",
      stationId: "s1",
      payload: { displayName: "X", quantity: 1, allergenFlags: [] },
    },
  );
  const later = new Date(received.getTime() + 20 * 60_000); // 20 min > 15
  const raised = await evaluateAndRaiseAlerts({ alerts, commands, now: () => later }, { tenantId: "t1", branchId: "b1" });
  assert.equal(raised.length, 1);
  assert.equal(raised[0]?.ruleCode, RULE_STALE_BEFORE_START);
  // Idempotent: a second evaluation does not create a duplicate.
  const again = await evaluateAndRaiseAlerts({ alerts, commands, now: () => later }, { tenantId: "t1", branchId: "b1" });
  assert.equal(again[0]?.id, raised[0]?.id);
  assert.equal((await alerts.listByBranch("t1", "b1")).length, 1);
});
