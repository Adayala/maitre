import type { FastifyInstance, FastifyRequest } from "fastify";
import type {
  JourneyOutboxEvent,
  OutboxOperationsPort,
} from "@maitre/organization";
import { TELEMETRY_SIGNALS, type TelemetryPort } from "@maitre/telemetry";

type JourneyTransition =
  | "VISIT_OPENED"
  | "ORDER_SUBMITTED"
  | "KITCHEN_STARTED"
  | "KITCHEN_READY"
  | "ORDER_DELIVERED"
  | "PAYMENT_CAPTURED"
  | "VISIT_CLOSED";

const FAILURE_ROUTES = new Map<string, JourneyTransition>([
  ["POST /v1/visits", "VISIT_OPENED"],
  ["POST /v1/orders/:id/submit", "ORDER_SUBMITTED"],
  ["POST /v1/kitchen/commands/:id/start", "KITCHEN_STARTED"],
  ["POST /v1/kitchen/commands/:id/mark-ready", "KITCHEN_READY"],
  ["POST /v1/kitchen/commands/:id/complete-handoff", "ORDER_DELIVERED"],
  ["POST /v1/payments/:id/capture", "PAYMENT_CAPTURED"],
  ["POST /v1/visits/:id/close", "VISIT_CLOSED"],
]);

const projectionsInFlight = new WeakMap<OutboxOperationsPort, Promise<void>>();

export function registerJourneyObservability(
  app: FastifyInstance,
  outbox: OutboxOperationsPort,
  telemetry: TelemetryPort,
): void {
  app.addHook("onResponse", async (request, reply) => {
    if (reply.statusCode >= 400) {
      const transition = transitionForRequest(request);
      if (transition) {
        telemetry.increment(TELEMETRY_SIGNALS.journeyTransition, 1, {
          transition,
          outcome: "failure",
        });
      }
      return;
    }
    if (!FAILURE_ROUTES.has(`${request.method} ${request.routeOptions.url}`))
      return;
    await projectJourneyTelemetry(outbox, telemetry);
  });
}

export async function projectJourneyTelemetry(
  outbox: OutboxOperationsPort,
  telemetry: TelemetryPort,
  now: () => Date = () => new Date(),
): Promise<void> {
  const active = projectionsInFlight.get(outbox);
  if (active) return active;
  const projection = runProjection(outbox, telemetry, now).finally(() => {
    projectionsInFlight.delete(outbox);
  });
  projectionsInFlight.set(outbox, projection);
  return projection;
}

async function runProjection(
  outbox: OutboxOperationsPort,
  telemetry: TelemetryPort,
  now: () => Date,
): Promise<void> {
  const events = [...(await outbox.listJourneyEvents(5_000))].sort(
    (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
  );
  const indexes = buildIndexes(events);

  for (const event of events) {
    if (event.telemetryObservedAt) continue;
    const claimed = await outbox.claimJourneyEvent(
      event.eventId,
      now(),
      60_000,
    );
    if (!claimed) continue;
    const transition = transitionForEvent(event);
    if (transition) {
      const span = telemetry.startSpan(`journey ${transition}`, {
        kind: "CONSUMER",
        ...(event.traceparent ? { parentTraceparent: event.traceparent } : {}),
        attributes: {
          "journey.transition": transition,
          "journey.outcome": "success",
        },
      });
      try {
        telemetry.increment(TELEMETRY_SIGNALS.journeyTransition, 1, {
          transition,
          outcome: "success",
        });
        const durationMs = durationFor(event, transition, indexes);
        if (durationMs !== undefined) {
          telemetry.observe(TELEMETRY_SIGNALS.journeyDuration, durationMs, {
            transition,
            outcome: "success",
          });
        }
        span.end("OK");
      } catch (error) {
        span.end("ERROR");
        throw error;
      }
    }
    await outbox.markJourneyEventObserved(event.eventId, now());
  }
}

interface JourneyIndexes {
  visitOpenedAt: Map<string, Date>;
  orderVisit: Map<string, string>;
  orderSubmittedAt: Map<string, Date>;
  commandOrder: Map<string, string>;
  commandStartedAt: Map<string, Date>;
  orderReadyAt: Map<string, Date>;
  checkVisit: Map<string, string>;
  deliveredByVisit: Map<string, Date>;
}

function buildIndexes(events: readonly JourneyOutboxEvent[]): JourneyIndexes {
  const indexes: JourneyIndexes = {
    visitOpenedAt: new Map(),
    orderVisit: new Map(),
    orderSubmittedAt: new Map(),
    commandOrder: new Map(),
    commandStartedAt: new Map(),
    orderReadyAt: new Map(),
    checkVisit: new Map(),
    deliveredByVisit: new Map(),
  };
  for (const event of events) {
    const payload = objectPayload(event.payload);
    const visitId = stringField(payload, "visitId");
    const orderId = stringField(payload, "orderId");
    const checkId = stringField(payload, "checkId");
    if (event.eventName === "floor.visit.opened.v1" && visitId) {
      indexes.visitOpenedAt.set(visitId, event.occurredAt);
    }
    if (event.eventName === "ordering.order.submitted.v1" && orderId) {
      if (visitId) indexes.orderVisit.set(orderId, visitId);
      indexes.orderSubmittedAt.set(orderId, event.occurredAt);
    }
    if (event.eventName === "kitchen.command.received.v1" && orderId) {
      indexes.commandOrder.set(event.aggregateId, orderId);
    }
    if (event.eventName === "kitchen.command.in-progress.v1") {
      indexes.commandStartedAt.set(event.aggregateId, event.occurredAt);
    }
    if (event.eventName === "kitchen.command.ready.v1" && orderId) {
      const prior = indexes.orderReadyAt.get(orderId);
      if (!prior || event.occurredAt > prior) {
        indexes.orderReadyAt.set(orderId, event.occurredAt);
      }
    }
    if (event.eventName === "floor.check.opened.v1" && checkId && visitId) {
      indexes.checkVisit.set(checkId, visitId);
    }
    if (event.eventName === "ordering.order.delivered.v1" && orderId) {
      const relatedVisit = indexes.orderVisit.get(orderId);
      if (relatedVisit) {
        const prior = indexes.deliveredByVisit.get(relatedVisit);
        if (!prior || event.occurredAt > prior) {
          indexes.deliveredByVisit.set(relatedVisit, event.occurredAt);
        }
      }
    }
  }
  return indexes;
}

function durationFor(
  event: JourneyOutboxEvent,
  transition: JourneyTransition,
  indexes: JourneyIndexes,
): number | undefined {
  const payload = objectPayload(event.payload);
  const visitId = stringField(payload, "visitId");
  const orderId =
    stringField(payload, "orderId") ??
    indexes.commandOrder.get(event.aggregateId);
  const checkId = stringField(payload, "checkId");
  let baseline: Date | undefined;
  switch (transition) {
    case "ORDER_SUBMITTED":
      baseline = visitId ? indexes.visitOpenedAt.get(visitId) : undefined;
      break;
    case "KITCHEN_STARTED":
      baseline = orderId ? indexes.orderSubmittedAt.get(orderId) : undefined;
      break;
    case "KITCHEN_READY":
      baseline = indexes.commandStartedAt.get(event.aggregateId);
      break;
    case "ORDER_DELIVERED":
      baseline = orderId ? indexes.orderReadyAt.get(orderId) : undefined;
      break;
    case "PAYMENT_CAPTURED": {
      const paymentVisit = checkId
        ? indexes.checkVisit.get(checkId)
        : undefined;
      baseline = paymentVisit
        ? (indexes.deliveredByVisit.get(paymentVisit) ??
          indexes.visitOpenedAt.get(paymentVisit))
        : undefined;
      break;
    }
    case "VISIT_CLOSED":
      baseline = visitId ? indexes.visitOpenedAt.get(visitId) : undefined;
      break;
    default:
      return undefined;
  }
  if (!baseline) return undefined;
  return Math.max(0, event.occurredAt.getTime() - baseline.getTime());
}

function transitionForEvent(
  event: JourneyOutboxEvent,
): JourneyTransition | undefined {
  switch (event.eventName) {
    case "floor.visit.opened.v1":
      return "VISIT_OPENED";
    case "ordering.order.submitted.v1":
      return "ORDER_SUBMITTED";
    case "kitchen.command.in-progress.v1":
      return "KITCHEN_STARTED";
    case "kitchen.command.ready.v1":
      return "KITCHEN_READY";
    case "ordering.order.delivered.v1":
      return "ORDER_DELIVERED";
    case "payment.captured.v1":
      return "PAYMENT_CAPTURED";
    case "floor.visit.closed.v1":
      return "VISIT_CLOSED";
    default:
      return undefined;
  }
}

function transitionForRequest(
  request: FastifyRequest,
): JourneyTransition | undefined {
  return FAILURE_ROUTES.get(`${request.method} ${request.routeOptions.url}`);
}

function objectPayload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringField(
  value: Record<string, unknown>,
  field: string,
): string | undefined {
  const candidate = value[field];
  return typeof candidate === "string" ? candidate : undefined;
}
