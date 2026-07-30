import assert from "node:assert/strict";
import { test } from "node:test";
import {
  InMemoryTelemetry,
  LOCAL_TELEMETRY_CAPABILITY,
  TELEMETRY_SIGNALS,
} from "../index.js";

test("in-memory telemetry records deterministic metric and span evidence", () => {
  const telemetry = new InMemoryTelemetry();
  telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
    method: "GET",
    route: "/v1/visits/:id",
    status_class: "2xx",
    outcome: "success",
  });
  const span = telemetry.startSpan("GET /v1/visits/:id");
  span.end("OK");
  span.end("ERROR");

  assert.equal(telemetry.metrics.length, 1);
  assert.equal(telemetry.spans.length, 1);
  assert.equal(telemetry.spans[0]?.outcome, "OK");
  assert.equal(LOCAL_TELEMETRY_CAPABILITY.remoteExport, "NOT_OPERATIONAL");
});

test("telemetry rejects identifiers, raw URLs and secret canaries", () => {
  const telemetry = new InMemoryTelemetry();
  assert.throws(
    () =>
      telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
        method: "GET",
        route: "/v1/visits",
        status_class: "2xx",
        outcome: "success",
        tenant_id: "00000000-0000-0000-0000-000000000001",
      }),
    /telemetry-label-not-allowed/,
  );
  assert.throws(
    () =>
      telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
        method: "GET",
        route: "/v1/visits/00000000-0000-4000-8000-000000000001",
        status_class: "2xx",
        outcome: "success",
      }),
    /telemetry-route-not-template/,
  );
  assert.throws(
    () =>
      telemetry.gauge(TELEMETRY_SIGNALS.outboxBacklog, 1, {
        status: "Bearer secret-canary",
      }),
    /telemetry-label-value-rejected/,
  );
});

test("telemetry enforces a per-signal cardinality budget", () => {
  const telemetry = new InMemoryTelemetry(2);
  for (const route of ["/v1/visits", "/v1/orders"]) {
    telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
      method: "GET",
      route,
      status_class: "2xx",
      outcome: "success",
    });
  }

  assert.throws(
    () =>
      telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
        method: "GET",
        route: "/v1/checks",
        status_class: "2xx",
        outcome: "success",
      }),
    /telemetry-cardinality-budget-exceeded/,
  );
});
