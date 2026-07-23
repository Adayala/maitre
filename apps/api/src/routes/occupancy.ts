import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { releaseOccupancy } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound } from "../http/problem-details.js";

// SPEC-056 — Occupancy API. Seat/move commands live under
// /v1/visits/:id/move and Visit creation (visits.ts) since Occupancy
// always exists in service of a Visit in this simplified model; this file
// covers history reads and standalone release.
export async function registerOccupancyRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{ Params: { id: string } }>("/v1/visits/:id/occupancies", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "occupancy:manage");
      const occupancies = await container.occupancies.listByVisit(ctx.tenantId, req.params.id);
      return { data: occupancies };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/occupancies/:id/release", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "occupancy:manage");
      const occupancy = await releaseOccupancy(
        { occupancies: container.occupancies },
        { tenantId: ctx.tenantId, occupancyId: req.params.id },
      );
      return { data: occupancy };
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Occupancy"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
