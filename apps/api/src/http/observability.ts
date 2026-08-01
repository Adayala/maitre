import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  TELEMETRY_SIGNALS,
  type SpanOptions,
  type TelemetryAttributes,
  type TelemetryPort,
  type TelemetrySignal,
  type TelemetrySpan,
} from "@maitre/telemetry";

interface RequestTelemetryContext {
  correlationId: string;
  startedAt: number;
  span: TelemetrySpan;
  telemetry: TelemetryPort;
  traceparent?: string;
}

const requestTelemetry = new WeakMap<FastifyRequest, RequestTelemetryContext>();
const activeRequestTelemetry = new AsyncLocalStorage<RequestTelemetryContext>();

export function registerHttpObservability(
  app: FastifyInstance,
  telemetry: TelemetryPort,
): void {
  const activeRequests = new Map<string, number>();
  app.addHook("onRequest", async (request, reply) => {
    const correlationId = validCorrelationId(
      request.headers["x-correlation-id"],
    );
    const traceparent = validTraceparent(request.headers["traceparent"]);
    const route = stableRoute(request);
    const span = telemetry.startSpan(`${request.method} ${route}`, {
      kind: "SERVER",
      attributes: {
        "http.request.method": request.method,
        "http.route": route,
      },
      ...(traceparent ? { parentTraceparent: traceparent } : {}),
    });

    const effectiveTraceparent = span.traceparent ?? traceparent;
    const context: RequestTelemetryContext = {
      correlationId,
      startedAt: performance.now(),
      span,
      telemetry,
      ...(effectiveTraceparent ? { traceparent: effectiveTraceparent } : {}),
    };
    requestTelemetry.set(request, context);
    activeRequestTelemetry.enterWith(context);
    updateActiveRequests(telemetry, activeRequests, request.method, route, 1);
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
    updateActiveRequests(
      telemetry,
      activeRequests,
      request.method,
      stableRoute(request),
      -1,
    );
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

export function currentRequestTelemetryContext():
  | Readonly<Pick<RequestTelemetryContext, "correlationId" | "traceparent">>
  | undefined {
  return activeRequestTelemetry.getStore();
}

export function startRequestTelemetrySpan(
  request: FastifyRequest,
  name: string,
  options: Omit<SpanOptions, "parentTraceparent"> = {},
): TelemetrySpan | undefined {
  const context = requestTelemetry.get(request);
  if (!context) return undefined;
  return context.telemetry.startSpan(name, {
    ...options,
    ...(context.traceparent ? { parentTraceparent: context.traceparent } : {}),
  });
}

export function incrementRequestTelemetry(
  request: FastifyRequest,
  signal: TelemetrySignal,
  attributes: TelemetryAttributes,
): void {
  requestTelemetry.get(request)?.telemetry.increment(signal, 1, attributes);
}

function stableRoute(request: FastifyRequest): string {
  const route = request.routeOptions.url;
  return route && !route.includes("*") ? route : "UNMATCHED";
}

function validCorrelationId(value: string | string[] | undefined): string {
  if (typeof value === "string" && UUID.test(value)) return value.toLowerCase();
  return randomUUID();
}

function validTraceparent(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  const match = TRACEPARENT.exec(normalized);
  if (!match || /^0+$/.test(match[1]!) || /^0+$/.test(match[2]!))
    return undefined;
  return normalized;
}

function updateActiveRequests(
  telemetry: TelemetryPort,
  activeRequests: Map<string, number>,
  method: string,
  route: string,
  delta: 1 | -1,
): void {
  const key = `${method} ${route}`;
  const current = Math.max(0, (activeRequests.get(key) ?? 0) + delta);
  activeRequests.set(key, current);
  telemetry.gauge(TELEMETRY_SIGNALS.httpActiveRequests, current, {
    method,
    route,
  });
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
