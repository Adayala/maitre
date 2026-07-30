import { performance } from "node:perf_hooks";
import { assertSpanAttributes, assertTelemetryAttributes } from "./policy.js";
import type {
  SpanOptions,
  TelemetryAttributes,
  TelemetryPort,
  TelemetrySignal,
  TelemetrySpan,
} from "./telemetry.js";

export interface MetricRecord {
  kind: "counter" | "histogram" | "gauge";
  signal: TelemetrySignal;
  value: number;
  attributes: TelemetryAttributes;
}

export interface SpanRecord {
  name: string;
  attributes: TelemetryAttributes;
  parentTraceparent?: string;
  durationMs: number;
  outcome: "OK" | "ERROR";
}

const NOOP_SPAN: TelemetrySpan = { end() {} };

export class NoopTelemetry implements TelemetryPort {
  increment(): void {}
  observe(): void {}
  gauge(): void {}
  startSpan(): TelemetrySpan {
    return NOOP_SPAN;
  }
}

export class InMemoryTelemetry implements TelemetryPort {
  readonly metrics: MetricRecord[] = [];
  readonly spans: SpanRecord[] = [];
  private readonly seriesBySignal = new Map<TelemetrySignal, Set<string>>();

  constructor(private readonly cardinalityBudgetPerSignal = 256) {}

  increment(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    this.record("counter", signal, value, attributes);
  }

  observe(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    this.record("histogram", signal, value, attributes);
  }

  gauge(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    this.record("gauge", signal, value, attributes);
  }

  startSpan(name: string, options: SpanOptions = {}): TelemetrySpan {
    assertSpanAttributes(options.attributes ?? {});
    const startedAt = performance.now();
    let ended = false;
    return {
      ...(options.parentTraceparent
        ? { traceparent: options.parentTraceparent }
        : {}),
      end: (outcome = "OK") => {
        if (ended) return;
        ended = true;
        this.spans.push({
          name,
          attributes: options.attributes ?? {},
          ...(options.parentTraceparent
            ? { parentTraceparent: options.parentTraceparent }
            : {}),
          durationMs: Math.max(0, performance.now() - startedAt),
          outcome,
        });
      },
    };
  }

  private record(
    kind: MetricRecord["kind"],
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`telemetry-value-invalid:${signal}`);
    }
    assertTelemetryAttributes(signal, attributes);
    const signature = JSON.stringify(
      Object.entries(attributes).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    );
    const series = this.seriesBySignal.get(signal) ?? new Set<string>();
    series.add(signature);
    if (series.size > this.cardinalityBudgetPerSignal) {
      throw new Error(`telemetry-cardinality-budget-exceeded:${signal}`);
    }
    this.seriesBySignal.set(signal, series);
    this.metrics.push({ kind, signal, value, attributes: { ...attributes } });
  }
}
