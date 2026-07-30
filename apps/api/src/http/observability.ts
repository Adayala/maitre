import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  TELEMETRY_SIGNALS,
  type TelemetryPort,
  type TelemetrySpan,
} from "@maitre/telemetry";

interface RequestTelemetryContext {
  correlationId: string;
  startedAt: number;
  span: TelemetrySpan;
  traceparent?: string;
}

const requestTelemetry = new WeakMap<FastifyRequest, RequestTelemetryContext>();

export function registerHttpObservability(
  app: FastifyInstance,
  telemetry: TelemetryPort,
): void {
  app.addHook("onRequest", async (request, reply) => {
    const correlationId = validCorrelationId(request.headers["x-correlation-id"]);
    const traceparent = validTraceparent(request.headers["traceparent"]);
    const route = stableRoute(request);
    const span = telemetry.startSpan(`${request.method} ${route}`, {
      attributes: {
        "http.request.method": request.method,
        "http.route": route,
      },
      ...(traceparent ? { parentTraceparent: traceparent } : {}),
    });

    requestTelemetry.set(request, {
      correlationId,
      startedAt: performance.now(),
      span,
      ...(traceparent ? { traceparent } : {}),
    });
    reply.header("x-correlation-id", correlationId);
  });

  app.addHook("onResponse", async (request, reply) => {
    const context = requestTelemetry.get(request);
    if (!context) return;

    const statusClass = `${Math.floor(reply.statusCode / 100)}xx`;
    const outcome = reply.statusCode < 500 ? "success" : "error";
    const attributes = {
      method: request.method,
      route: stableRoute(request),
      status_class: statusClass,
      outcome,
    };
    telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, attributes);
    telemetry.observe(
      TELEMETRY_SIGNALS.httpDuration,
      Math.max(0, performance.now() - context.startedAt),
      attributes,
    );
    context.span.end(outcome === "success" ? "OK" : "ERROR");
  });
}

export function correlationIdForRequest(
  request: FastifyRequest,
): string | undefined {
  return requestTelemetry.get(request)?.correlationId;
}

export function traceparentForRequest(
  request: FastifyRequest,
): string | undefined {
  return requestTelemetry.get(request)?.traceparent;
}

function stableRoute(request: FastifyRequest): string {
  const route = request.routeOptions.url;
  return route && !route.includes("*") ? route : "UNMATCHED";
}

function validCorrelationId(value: string | string[] | undefined): string {
  if (typeof value === "string" && UUID.test(value)) return value.toLowerCase();
  return randomUUID();
}

function validTraceparent(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  const match = TRACEPARENT.exec(normalized);
  if (!match || /^0+$/.test(match[1]!) || /^0+$/.test(match[2]!)) return undefined;
  return normalized;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRACEPARENT =
  /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
