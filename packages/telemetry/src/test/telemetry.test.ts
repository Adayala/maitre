import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import {
  createTelemetryFromEnvironment,
  InMemoryTelemetry,
  isOpenTelemetryConfigured,
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

test("OpenTelemetry remote export activates only with explicit OTLP configuration", () => {
  assert.equal(isOpenTelemetryConfigured({}), false);
  assert.equal(
    isOpenTelemetryConfigured({
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://otel.example.test",
    }),
    true,
  );
  assert.equal(
    isOpenTelemetryConfigured({
      OTEL_SDK_DISABLED: "true",
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://otel.example.test",
    }),
    false,
  );
});

test(
  "OpenTelemetry adapter exports traces and metrics over OTLP/HTTP",
  { skip: process.env["OTEL_EXPORT_INTEGRATION"] !== "1" },
  async () => {
    const requests: string[] = [];
    const collector = createServer((request, response) => {
      requests.push(request.url ?? "");
      request.resume();
      response.writeHead(200, { "content-type": "application/x-protobuf" });
      response.end();
    });
    collector.listen(0, "127.0.0.1");
    await once(collector, "listening");
    const address = collector.address();
    assert.ok(address && typeof address === "object");
    const endpoint = `http://127.0.0.1:${address.port}`;
    const runtime = createTelemetryFromEnvironment({
      OTEL_SERVICE_NAME: "maitre-telemetry-test",
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: `${endpoint}/v1/traces`,
      OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: `${endpoint}/v1/metrics`,
      OTEL_METRIC_EXPORT_INTERVAL: "60000",
      OTEL_METRIC_EXPORT_TIMEOUT: "5000",
    });
    try {
      runtime.telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, {
        method: "GET",
        route: "/health/live",
        status_class: "2xx",
        outcome: "success",
      });
      const span = runtime.telemetry.startSpan("GET /health/live", {
        kind: "SERVER",
        attributes: {
          "http.request.method": "GET",
          "http.route": "/health/live",
        },
      });
      assert.match(
        span.traceparent ?? "",
        /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/,
      );
      span.end("OK");
      await runtime.shutdown();
      assert.equal(runtime.capability.remoteExport, "OPERATIONAL");
      assert.equal(requests.includes("/v1/traces"), true);
      assert.equal(requests.includes("/v1/metrics"), true);
    } finally {
      collector.close();
      await once(collector, "close");
    }
  },
);
