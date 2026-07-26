import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { calculateAvailability, blocksCapacity } from "@maitre/reservations";
import type { AvailabilityWindow } from "@maitre/reservations";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, badRequest, notFound } from "../http/problem-details.js";

// SPEC-074 — Availability API. GET-only, computed live via
// calculateAvailability (simplified single-table model, see
// domain/calculate-availability.ts) against current Reservation and Floor
// Occupancy data for the branch — no dedicated repository of its own, no
// public-capability variant (deferred per SPEC-080 scope note).
const querySchema = z.object({
  partySize: z.coerce.number().int().positive(),
  startAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive(),
});

export async function registerAvailabilityRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{
    Params: { branchId: string };
    Querystring: { partySize?: string; startAt?: string; durationMinutes?: string };
  }>("/v1/branches/:branchId/availability", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:read");
      const query = querySchema.parse(req.query);
      const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
      if (!branch) {
        throw notFound("Branch");
      }

      const salons = await container.salons.listByBranch(ctx.tenantId, req.params.branchId);
      const tables = (
        await Promise.all(salons.map((s) => container.tables.listBySalon(ctx.tenantId, s.id)))
      )
        .flat()
        .map((t) => ({ id: t.id, capacity: t.capacity }));

      const reservations = await container.reservations.listByBranch(ctx.tenantId, req.params.branchId);
      const reservedWindows = new Map<string, AvailabilityWindow[]>();
      for (const reservation of reservations) {
        if (!blocksCapacity(reservation) || !reservation.tableIds) continue;
        const end = new Date(
          reservation.startAt.getTime() + reservation.durationMinutes * 60_000,
        );
        for (const tableId of reservation.tableIds) {
          const list = reservedWindows.get(tableId) ?? [];
          list.push({ start: reservation.startAt, end });
          reservedWindows.set(tableId, list);
        }
      }

      const activeOccupancyTableIds = new Set<string>();
      for (const table of tables) {
        const active = await container.occupancies.findActiveByTable(ctx.tenantId, table.id);
        if (active) activeOccupancyTableIds.add(table.id);
      }

      const result = calculateAvailability({
        partySize: query.partySize,
        startAt: query.startAt,
        durationMinutes: query.durationMinutes,
        tables,
        reservedWindows,
        activeOccupancyTableIds,
      });

      return {
        data: {
          asOf: new Date().toISOString(),
          timezone: branch.timezone,
          freshness: "LIVE" as const,
          startAt: query.startAt.toISOString(),
          durationMinutes: query.durationMinutes,
          available: result.available,
          freeTableIds: result.freeTableIds,
        },
      };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
