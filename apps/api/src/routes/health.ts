import type { FastifyInstance } from "fastify";
import { TELEMETRY_SIGNALS, type TelemetryPort } from "@maitre/telemetry";
import type { Container } from "../composition/container.js";
import { startRequestTelemetrySpan } from "../http/observability.js";

const READINESS_PROBE_TENANT_ID = "00000000-0000-0000-0000-000000000000";

// SPEC-213 §3 — /health/live and /health/ready.
export async function registerHealthRoutes(
  app: FastifyInstance,
  container: Container,
  telemetry: TelemetryPort,
): Promise<void> {
  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health/ready", async (request, reply) => {
    const start = Date.now();
    const timeoutMs = 500;
    const dependencySpan = startRequestTelemetrySpan(
      request,
      "dependency database readiness",
      {
        kind: "CLIENT",
        attributes: {
          "dependency.name": "database",
          "dependency.operation": "readiness",
        },
      },
    );

    try {
      await Promise.race([
        container.tenants.findById(READINESS_PROBE_TENANT_ID),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeoutMs),
        ),
      ]);
      telemetry.gauge(TELEMETRY_SIGNALS.readiness, 1, {
        dependency: "database",
        outcome: "ready",
      });
      dependencySpan?.end("OK");
      try {
        const outbox = await container.outbox.getOperationalSnapshot();
        for (const [status, count] of Object.entries(outbox.counts)) {
          telemetry.gauge(TELEMETRY_SIGNALS.outboxBacklog, count, { status });
        }
        telemetry.gauge(
          TELEMETRY_SIGNALS.outboxOldestAge,
          outbox.oldestPendingAgeMs,
          { status: "PENDING" },
        );
        telemetry.gauge(
          TELEMETRY_SIGNALS.outboxPublished,
          outbox.publishedLast5m,
          {},
        );
        telemetry.gauge(TELEMETRY_SIGNALS.outboxRetries, outbox.retryCount, {});
        telemetry.gauge(
          TELEMETRY_SIGNALS.outboxFailures,
          outbox.failedCount,
          {},
        );
        telemetry.gauge(
          TELEMETRY_SIGNALS.outboxExpiredLeases,
          outbox.expiredLeaseCount,
          {},
        );
      } catch (error) {
        request.log.warn(
          {
            eventCode: "OUTBOX_HEALTH_COLLECTION_FAILED",
            errorName: error instanceof Error ? error.name : "UnknownError",
          },
          "outbox operational snapshot failed",
        );
      }
      return { status: "ready", checkedInMs: Date.now() - start };
    } catch {
      dependencySpan?.end("ERROR");
      telemetry.gauge(TELEMETRY_SIGNALS.readiness, 0, {
        dependency: "database",
        outcome: "not_ready",
      });
      reply.code(503);
      return { status: "not_ready", checkedInMs: Date.now() - start };
    }
  });
}
