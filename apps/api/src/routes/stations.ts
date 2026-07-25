import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createStation,
  updateStation,
  activateStation,
  deactivateStation,
  DuplicateStationCodeError,
  StationHasActiveCommandsError,
} from "@maitre/kitchen";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-103 — Stations API. Code is unique per branch; deactivate refuses while
// non-terminal Commands remain (SPEC-099). If-Match enforcement deferred.
const createStationBodySchema = z.object({
  code: z.string().min(1),
  displayName: z.string().min(1),
  capabilities: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
});

const updateStationBodySchema = z.object({
  displayName: z.string().min(1).optional(),
  capabilities: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
});

export async function registerStationRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.post<{ Params: { branchId: string } }>("/v1/branches/:branchId/kitchen/stations", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:station_manage");
      const body = createStationBodySchema.parse(req.body);
      const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));

      const station = await createStation(
        { stations: container.stations },
        {
          tenantId: ctx.tenantId,
          brandId: branch.brandId,
          branchId: branch.id,
          code: body.code,
          displayName: body.displayName,
          ...omitUndefined({ capabilities: body.capabilities, displayOrder: body.displayOrder }),
        },
      );
      reply.code(201);
      return { data: station };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof DuplicateStationCodeError) return sendProblem(reply, correlationId, conflict(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { branchId: string } }>("/v1/branches/:branchId/kitchen/stations", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:queue_read");
      const stations = await container.stations.listByBranch(ctx.tenantId, req.params.branchId);
      return { data: stations };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/kitchen/stations/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:queue_read");
      const station = await container.stations.findById(ctx.tenantId, req.params.id);
      if (!station) return sendProblem(reply, correlationId, notFound("Station"));
      return { data: station };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/kitchen/stations/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:station_manage");
      const body = updateStationBodySchema.parse(req.body);
      const station = await updateStation(
        { stations: container.stations },
        { tenantId: ctx.tenantId, id: req.params.id, ...omitUndefined(body) },
      );
      return { data: station };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Station"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/stations/:id/activate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:station_manage");
      const station = await activateStation({ stations: container.stations }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: station };
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Station"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/stations/:id/deactivate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:station_manage");
      const station = await deactivateStation(
        { stations: container.stations, commands: container.commands },
        { tenantId: ctx.tenantId, id: req.params.id },
      );
      return { data: station };
    } catch (err) {
      if (err instanceof StationHasActiveCommandsError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Station"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
