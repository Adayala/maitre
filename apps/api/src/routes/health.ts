import type { FastifyInstance } from "fastify";
import { TELEMETRY_SIGNALS, type TelemetryPort } from "@maitre/telemetry";
import type { Container } from "../composition/container.js";

const READINESS_PROBE_TENANT_ID = "00000000-0000-0000-0000-000000000000";

// SPEC-213 §3 — /health/live and /health/ready.
export async function registerHealthRoutes(
  app: FastifyInstance,
  container: Container,
  telemetry: TelemetryPort,
): Promise<void> {
  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health/ready", async (_req, reply) => {
    const start = Date.now();
    const timeoutMs = 500;

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
      return { status: "ready", checkedInMs: Date.now() - start };
    } catch {
      telemetry.gauge(TELEMETRY_SIGNALS.readiness, 0, {
        dependency: "database",
        outcome: "not_ready",
      });
      reply.code(503);
      return { status: "not_ready", checkedInMs: Date.now() - start };
    }
  });
}
