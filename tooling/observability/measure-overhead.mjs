import { performance } from "node:perf_hooks";
import {
  InMemoryTelemetry,
  NoopTelemetry,
  OpenTelemetryAdapter,
  TELEMETRY_SIGNALS,
} from "../../packages/telemetry/dist/index.js";

const samples = positiveInteger(process.env["OBSERVABILITY_BENCH_SAMPLES"], 30);
const iterations = positiveInteger(
  process.env["OBSERVABILITY_BENCH_ITERATIONS"],
  10_000,
);
const projectedRequests = positiveInteger(
  process.env["OBSERVABILITY_PROJECTED_REQUESTS"],
  100_000,
);

const requestAttributes = {
  method: "POST",
  route: "/v1/orders/:orderId/submit",
  status_class: "2xx",
  outcome: "success",
};
const durationAttributes = { ...requestAttributes };
const activeAttributes = {
  method: "POST",
  route: "/v1/orders/:orderId/submit",
};
const spanAttributes = {
  "http.request.method": "POST",
  "http.route": "/v1/orders/:orderId/submit",
};

function instrumentRequest(telemetry) {
  telemetry.gauge(TELEMETRY_SIGNALS.httpActiveRequests, 1, activeAttributes);
  const span = telemetry.startSpan("POST /v1/orders/:orderId/submit", {
    kind: "SERVER",
    attributes: spanAttributes,
  });
  telemetry.increment(TELEMETRY_SIGNALS.httpRequests, 1, requestAttributes);
  telemetry.observe(TELEMETRY_SIGNALS.httpDuration, 12, durationAttributes);
  telemetry.gauge(TELEMETRY_SIGNALS.httpActiveRequests, 0, activeAttributes);
  span.end("OK");
}

function benchmark(telemetry) {
  for (let index = 0; index < 1_000; index += 1) {
    instrumentRequest(telemetry);
  }

  const durations = [];
  for (let sample = 0; sample < samples; sample += 1) {
    const startedAt = performance.now();
    for (let index = 0; index < iterations; index += 1) {
      instrumentRequest(telemetry);
    }
    durations.push(((performance.now() - startedAt) * 1_000) / iterations);
  }
  return {
    p50MicrosecondsPerRequest: percentile(durations, 0.5),
    p95MicrosecondsPerRequest: percentile(durations, 0.95),
  };
}

const noop = benchmark(new NoopTelemetry());
const active = benchmark(new OpenTelemetryAdapter());
const evidenceTelemetry = new InMemoryTelemetry();
instrumentRequest(evidenceTelemetry);
const representativeRecords = [
  ...evidenceTelemetry.metrics,
  ...evidenceTelemetry.spans,
];
const representativeBytes = Buffer.byteLength(
  representativeRecords.map((record) => JSON.stringify(record)).join("\n"),
  "utf8",
);
const recordsPerRequest = representativeRecords.length;

const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  runtime: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
  },
  methodology: {
    samples,
    iterationsPerSample: iterations,
    workload:
      "one server span, request counter, duration histogram and two active-request gauge records",
    exporter:
      "OpenTelemetry API path with no network exporter; collector transport is measured separately by the export integration test",
  },
  overhead: {
    disabled: noop,
    instrumented: active,
    deltaP50MicrosecondsPerRequest: round(
      active.p50MicrosecondsPerRequest - noop.p50MicrosecondsPerRequest,
    ),
    deltaP95MicrosecondsPerRequest: round(
      active.p95MicrosecondsPerRequest - noop.p95MicrosecondsPerRequest,
    ),
  },
  volume: {
    logsPerRequest: 0,
    telemetryRecordsPerRequest: recordsPerRequest,
    representativeBytesPerRequest: representativeBytes,
    projectedRequests,
    projectedRecords: recordsPerRequest * projectedRequests,
    projectedUncompressedBytes: representativeBytes * projectedRequests,
  },
  assertions: {
    containsPayloads: false,
    containsResourceIdentifiers: false,
    finalProductionBudgetApproved: false,
  },
};

process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);

function percentile(values, ratio) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1),
  );
  return round(sorted[index] ?? 0);
}

function round(value) {
  return Math.round(value * 1_000) / 1_000;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
