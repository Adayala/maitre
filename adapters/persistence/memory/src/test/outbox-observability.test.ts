import assert from "node:assert/strict";
import { test } from "node:test";
import type { OutboxRecord } from "@maitre/organization";
import { InMemoryOutboxRepository } from "../outbox-repository.js";

const T0 = new Date("2026-07-30T12:00:00.000Z");

function record(
  eventId: string,
  eventName = "floor.visit.opened.v1",
): OutboxRecord {
  return {
    eventId,
    eventName,
    eventVersion: 1,
    occurredAt: T0,
    producer: "test",
    tenantId: "00000000-0000-4000-8000-000000000001",
    aggregateType: "Visit",
    aggregateId: "00000000-0000-4000-8000-000000000002",
    correlationId: "00000000-0000-4000-8000-000000000003",
    payload: {
      visitId: "00000000-0000-4000-8000-000000000002",
    },
    status: "PENDING",
    attempts: 0,
  };
}

test("in-memory outbox reports aggregate health without payloads or identifiers", async () => {
  let now = T0;
  const outbox = new InMemoryOutboxRepository(() => now);
  for (const id of ["event-1", "event-2", "event-3", "event-4"]) {
    await outbox.append(record(id));
  }
  now = new Date(T0.getTime() + 10 * 60_000);
  outbox.setOperationalState("event-2", {
    status: "PUBLISHED",
    attempts: 2,
    publishedAt: new Date(now.getTime() - 60_000),
  });
  outbox.setOperationalState("event-3", {
    status: "FAILED",
    attempts: 3,
  });
  outbox.setOperationalState("event-4", {
    status: "PROCESSING",
    attempts: 1,
    leaseExpiresAt: new Date(now.getTime() - 1),
  });

  const snapshot = await outbox.getOperationalSnapshot({ now });
  assert.deepEqual(snapshot, {
    counts: { PENDING: 1, PROCESSING: 1, PUBLISHED: 1, FAILED: 1 },
    oldestPendingAgeMs: 600_000,
    publishedLast5m: 1,
    retryCount: 3,
    failedCount: 1,
    expiredLeaseCount: 1,
  });
  assert.equal(JSON.stringify(snapshot).includes("visitId"), false);
});

test("journey observation marker survives repeated projections", async () => {
  const outbox = new InMemoryOutboxRepository(() => T0);
  await outbox.append(record("event-1"));
  assert.equal(
    (await outbox.listJourneyEvents())[0]?.telemetryObservedAt,
    undefined,
  );
  assert.equal(await outbox.claimJourneyEvent("event-1", T0, 60_000), true);
  assert.equal(
    await outbox.claimJourneyEvent(
      "event-1",
      new Date(T0.getTime() + 30_000),
      60_000,
    ),
    false,
  );
  assert.equal(
    await outbox.claimJourneyEvent(
      "event-1",
      new Date(T0.getTime() + 60_001),
      60_000,
    ),
    true,
  );
  await outbox.markJourneyEventObserved(
    "event-1",
    new Date(T0.getTime() + 1_000),
  );
  assert.equal(
    (await outbox.listJourneyEvents())[0]?.telemetryObservedAt?.toISOString(),
    "2026-07-30T12:00:01.000Z",
  );
});
