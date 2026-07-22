import type { FastifyInstance } from "fastify";
import type { Container } from "../composition/container.js";

// SPEC-213 §3 — /health/live and /health/ready.
export async function registerHealthRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health/ready", async (_req, reply) => {
    const start = Date.now();
    const timeoutMs = 500;

    try {
      await Promise.race([
        container.tenants.findById("readiness-probe"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeoutMs),
        ),
      ]);
      return { status: "ready", checkedInMs: Date.now() - start };
    } catch {
      reply.code(503);
      return { status: "not_ready", checkedInMs: Date.now() - start };
    }
  });
}
