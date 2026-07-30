import {
  ROOT_CONTEXT,
  SpanKind,
  SpanStatusCode,
  metrics,
  propagation,
  trace,
  type Attributes,
  type Context,
  type Meter,
  type Tracer,
} from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK, metrics as sdkMetrics } from "@opentelemetry/sdk-node";
import { NoopTelemetry } from "./adapters.js";
import { assertSpanAttributes, assertTelemetryAttributes } from "./policy.js";
import {
  LOCAL_TELEMETRY_CAPABILITY,
  type SpanOptions,
  type TelemetryAttributes,
  type TelemetryCapabilityStatus,
  type TelemetryPort,
  type TelemetrySignal,
  type TelemetrySpan,
} from "./telemetry.js";

export interface RuntimeTelemetry {
  telemetry: TelemetryPort;
  capability: TelemetryCapabilityStatus;
  shutdown(): Promise<void>;
}

export class OpenTelemetryAdapter implements TelemetryPort {
  private readonly counters = new Map<
    TelemetrySignal,
    ReturnType<Meter["createCounter"]>
  >();
  private readonly histograms = new Map<
    TelemetrySignal,
    ReturnType<Meter["createHistogram"]>
  >();
  private readonly gauges = new Map<
    TelemetrySignal,
    ReturnType<Meter["createGauge"]>
  >();

  constructor(
    private readonly meter: Meter = metrics.getMeter("maitre"),
    private readonly tracer: Tracer = trace.getTracer("maitre"),
  ) {}

  increment(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    assertMeasurement(signal, value, attributes);
    const instrument =
      this.counters.get(signal) ?? this.meter.createCounter(signal);
    this.counters.set(signal, instrument);
    instrument.add(value, toAttributes(attributes));
  }

  observe(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    assertMeasurement(signal, value, attributes);
    const instrument =
      this.histograms.get(signal) ?? this.meter.createHistogram(signal);
    this.histograms.set(signal, instrument);
    instrument.record(value, toAttributes(attributes));
  }

  gauge(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    assertMeasurement(signal, value, attributes);
    const instrument =
      this.gauges.get(signal) ?? this.meter.createGauge(signal);
    this.gauges.set(signal, instrument);
    instrument.record(value, toAttributes(attributes));
  }

  startSpan(name: string, options: SpanOptions = {}): TelemetrySpan {
    assertSpanAttributes(options.attributes ?? {});
    const parent = extractParent(options.parentTraceparent);
    const span = this.tracer.startSpan(
      name,
      {
        attributes: toAttributes(options.attributes ?? {}),
        kind: toSpanKind(options.kind),
      },
      parent,
    );
    const spanContext = span.spanContext();
    const traceparent = spanContext.isRemote
      ? options.parentTraceparent
      : formatTraceparent(spanContext);
    let ended = false;
    return {
      ...(traceparent ? { traceparent } : {}),
      end(outcome = "OK") {
        if (ended) return;
        ended = true;
        span.setStatus({
          code: outcome === "OK" ? SpanStatusCode.OK : SpanStatusCode.ERROR,
        });
        span.end();
      },
    };
  }
}

export function createTelemetryFromEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeTelemetry {
  if (!isOpenTelemetryConfigured(env)) {
    return {
      telemetry: new NoopTelemetry(),
      capability: LOCAL_TELEMETRY_CAPABILITY,
      async shutdown() {},
    };
  }

  const baseEndpoint = env["OTEL_EXPORTER_OTLP_ENDPOINT"];
  const traceEndpoint =
    env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] ??
    appendSignalPath(baseEndpoint, "traces");
  const metricEndpoint =
    env["OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"] ??
    appendSignalPath(baseEndpoint, "metrics");
  const metricReader = new sdkMetrics.PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      ...(metricEndpoint ? { url: metricEndpoint } : {}),
      concurrencyLimit: 1,
    }),
    exportIntervalMillis: positiveInteger(
      env["OTEL_METRIC_EXPORT_INTERVAL"],
      60_000,
    ),
    exportTimeoutMillis: positiveInteger(
      env["OTEL_METRIC_EXPORT_TIMEOUT"],
      30_000,
    ),
  });
  const sdk = new NodeSDK({
    serviceName: env["OTEL_SERVICE_NAME"] ?? "maitre-api",
    traceExporter: new OTLPTraceExporter({
      ...(traceEndpoint ? { url: traceEndpoint } : {}),
      concurrencyLimit: 1,
    }),
    metricReaders: [metricReader],
  });
  sdk.start();

  return {
    telemetry: new OpenTelemetryAdapter(),
    capability: {
      ...LOCAL_TELEMETRY_CAPABILITY,
      remoteExport: "OPERATIONAL",
    },
    shutdown: () => sdk.shutdown(),
  };
}

export function isOpenTelemetryConfigured(env: NodeJS.ProcessEnv): boolean {
  if (env["OTEL_SDK_DISABLED"]?.toLowerCase() === "true") return false;
  return Boolean(
    env["OTEL_EXPORTER_OTLP_ENDPOINT"] ||
    env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] ||
    env["OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"],
  );
}

function assertMeasurement(
  signal: TelemetrySignal,
  value: number,
  attributes: TelemetryAttributes,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`telemetry-value-invalid:${signal}`);
  }
  assertTelemetryAttributes(signal, attributes);
}

function extractParent(traceparent: string | undefined): Context {
  if (!traceparent) return ROOT_CONTEXT;
  const carrier: Record<string, string> = { traceparent };
  return propagation.extract(ROOT_CONTEXT, carrier, {
    get(carrier, key) {
      return carrier[key];
    },
    keys(carrier) {
      return Object.keys(carrier);
    },
  });
}

function formatTraceparent(
  context: ReturnType<ReturnType<Tracer["startSpan"]>["spanContext"]>,
): string | undefined {
  if (!context.traceId || !context.spanId) return undefined;
  return `00-${context.traceId}-${context.spanId}-${context.traceFlags
    .toString(16)
    .padStart(2, "0")}`;
}

function toSpanKind(kind: SpanOptions["kind"]): SpanKind {
  switch (kind) {
    case "SERVER":
      return SpanKind.SERVER;
    case "CLIENT":
      return SpanKind.CLIENT;
    case "PRODUCER":
      return SpanKind.PRODUCER;
    case "CONSUMER":
      return SpanKind.CONSUMER;
    default:
      return SpanKind.INTERNAL;
  }
}

function toAttributes(attributes: TelemetryAttributes): Attributes {
  return { ...attributes };
}

function appendSignalPath(
  endpoint: string | undefined,
  signal: "traces" | "metrics",
): string | undefined {
  if (!endpoint) return undefined;
  return `${endpoint.replace(/\/+$/, "")}/v1/${signal}`;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
