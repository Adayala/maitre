import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { getProductionQueue } from "@maitre/kitchen";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound } from "../http/problem-details.js";

// SPEC-100/104 — ProductionQueue, a computed read model per Station (priority
// DESC, receivedAt ASC, id ASC). Read-only: it never authorizes transitions.
export async function registerProductionQueueRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{ Params: { stationId: string } }>(
    "/v1/kitchen/stations/:stationId/production-queue",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "kitchen:queue_read");
        const station = await container.stations.findById(ctx.tenantId, req.params.stationId);
        if (!station) return sendProblem(reply, correlationId, notFound("Station"));
        const queue = await getProductionQueue(
          { commands: container.commands },
          { tenantId: ctx.tenantId, stationId: req.params.stationId },
        );
        return { data: queue };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
