import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCancellation, upsertCancellationPolicy } from "../index.js";
import { FakeCancellationPolicyRepository } from "./fakes.js";

test("upsertCancellationPolicy creates and then replaces the single tenant policy", async () => {
  const cancellationPolicies = new FakeCancellationPolicyRepository();

  const created = await upsertCancellationPolicy(
    { cancellationPolicies, now: () => new Date("2026-08-01T10:00:00Z") },
    {
      tenantId: "t1",
      name: "Standard",
      hoursBeforeStartCutoff: 24,
      feeDescription: "50% fee after cutoff",
    },
  );

  assert.equal(created.revision, 1);
  assert.equal(created.name, "Standard");
  assert.equal(created.hoursBeforeStartCutoff, 24);

  const replaced = await upsertCancellationPolicy(
    { cancellationPolicies, now: () => new Date("2026-08-02T10:00:00Z") },
    {
      tenantId: "t1",
      name: "Updated",
      hoursBeforeStartCutoff: 12,
    },
  );

  assert.equal(replaced.id, created.id);
  assert.equal(replaced.revision, 2);
  assert.equal(replaced.name, "Updated");
  assert.equal(replaced.hoursBeforeStartCutoff, 12);
  assert.equal(replaced.createdAt.toISOString(), created.createdAt.toISOString());
});

test("evaluateCancellation reports NO_POLICY, WITHIN_WINDOW and PAST_CUTOFF", () => {
  const startAt = new Date("2026-08-10T20:00:00Z");

  const noPolicy = evaluateCancellation(null, startAt, new Date("2026-08-09T10:00:00Z"));
  assert.deepEqual(noPolicy, {
    allowed: true,
    withinFreeCancellationWindow: true,
    reason: "NO_POLICY",
  });

  const policy = {
    id: "policy-1",
    tenantId: "t1",
    name: "Standard",
    hoursBeforeStartCutoff: 24,
    revision: 1,
    createdAt: new Date("2026-08-01T10:00:00Z"),
    updatedAt: new Date("2026-08-01T10:00:00Z"),
  };

  const withinWindow = evaluateCancellation(policy, startAt, new Date("2026-08-09T19:00:00Z"));
  assert.equal(withinWindow.allowed, true);
  assert.equal(withinWindow.withinFreeCancellationWindow, true);
  assert.equal(withinWindow.reason, "WITHIN_WINDOW");

  const pastCutoff = evaluateCancellation(policy, startAt, new Date("2026-08-10T02:00:00Z"));
  assert.equal(pastCutoff.allowed, true);
  assert.equal(pastCutoff.withinFreeCancellationWindow, false);
  assert.equal(pastCutoff.reason, "PAST_CUTOFF");
});
