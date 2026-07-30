import assert from "node:assert/strict";
import { test } from "node:test";
import { InMemoryOutboxRepository } from "@maitre/adapter-persistence-memory";
import type { OutboxRecord } from "@maitre/organization";
import { InMemoryTelemetry, TELEMETRY_SIGNALS } from "@maitre/telemetry";
import { projectJourneyTelemetry } from "../observability/journey.js";

const TRACEPARENT = "00-22222222222222222222222222222222-3333333333333333-01";
const VISIT_ID = "00000000-0000-4000-8000-000000000001";
const ORDER_ID = "00000000-0000-4000-8000-000000000002";
const COMMAND_ID = "00000000-0000-4000-8000-000000000003";
const CHECK_ID = "00000000-0000-4000-8000-000000000004";
const T0 = new Date("2026-07-30T12:00:00.000Z");

function event(
  offsetMs: number,
  eventName: string,
  aggregateType: string,
  aggregateId: string,
  payload: Record<string, unknown>,
): OutboxRecord {
  return {
    eventId: `00000000-0000-4000-8000-${String(offsetMs).padStart(12, "0")}`,
    eventName,
    eventVersion: 1,
    occurredAt: new Date(T0.getTime() + offsetMs),
    producer: "test",
    tenantId: "00000000-0000-4000-8000-000000000010",
    aggregateType,
    aggregateId,
    correlationId: "00000000-0000-4000-8000-000000000020",
    traceparent: TRACEPARENT,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

test("durable outbox facts emit each MVP transition and duration once", async () => {
  const outbox = new InMemoryOutboxRepository(() => T0);
  const events = [
    event(0, "floor.visit.opened.v1", "Visit", VISIT_ID, {
      visitId: VISIT_ID,
    }),
    event(5, "floor.check.opened.v1", "Check", CHECK_ID, {
      checkId: CHECK_ID,
      visitId: VISIT_ID,
    }),
    event(10, "ordering.order.submitted.v1", "Order", ORDER_ID, {
      orderId: ORDER_ID,
      visitId: VISIT_ID,
    }),
    event(11, "kitchen.command.received.v1", "Command", COMMAND_ID, {
      commandId: COMMAND_ID,
      orderId: ORDER_ID,
    }),
    event(20, "kitchen.command.in-progress.v1", "Command", COMMAND_ID, {
      commandId: COMMAND_ID,
    }),
    event(40, "kitchen.command.ready.v1", "Command", COMMAND_ID, {
      commandId: COMMAND_ID,
      orderId: ORDER_ID,
    }),
    event(50, "ordering.order.delivered.v1", "Order", ORDER_ID, {
      orderId: ORDER_ID,
      visitId: VISIT_ID,
    }),
    event(60, "payment.captured.v1", "Payment", "payment-1", {
      paymentId: "payment-1",
      checkId: CHECK_ID,
    }),
    event(70, "floor.visit.closed.v1", "Visit", VISIT_ID, {
      visitId: VISIT_ID,
    }),
  ];
  for (const item of events) await outbox.append(item);
  const telemetry = new InMemoryTelemetry();

  await projectJourneyTelemetry(
    outbox,
    telemetry,
    () => new Date(T0.getTime() + 100),
  );
  const transitions = telemetry.metrics.filter(
    (metric) => metric.signal === TELEMETRY_SIGNALS.journeyTransition,
  );
  assert.deepEqual(
    transitions.map((metric) => metric.attributes["transition"]),
    [
      "VISIT_OPENED",
      "ORDER_SUBMITTED",
      "KITCHEN_STARTED",
      "KITCHEN_READY",
      "ORDER_DELIVERED",
      "PAYMENT_CAPTURED",
      "VISIT_CLOSED",
    ],
  );
  assert.deepEqual(
    telemetry.metrics
      .filter((metric) => metric.signal === TELEMETRY_SIGNALS.journeyDuration)
      .map((metric) => [metric.attributes["transition"], metric.value]),
    [
      ["ORDER_SUBMITTED", 10],
      ["KITCHEN_STARTED", 10],
      ["KITCHEN_READY", 20],
      ["ORDER_DELIVERED", 10],
      ["PAYMENT_CAPTURED", 10],
      ["VISIT_CLOSED", 70],
    ],
  );
  assert.equal(telemetry.spans.length, 7);
  assert.equal(
    telemetry.spans.every((span) => span.parentTraceparent === TRACEPARENT),
    true,
  );

  await projectJourneyTelemetry(outbox, telemetry);
  assert.equal(
    telemetry.metrics.filter(
      (metric) => metric.signal === TELEMETRY_SIGNALS.journeyTransition,
    ).length,
    7,
  );
});
