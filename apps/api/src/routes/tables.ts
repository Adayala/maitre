import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createTable,
  SalonNotOperableError,
  DuplicateTableNumberError,
  InvalidTableCapacityError,
  TableCapacityExceedsSalonError,
  computeTableStatus,
  type Table,
} from "@maitre/organization";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";
import { projectTableStatus } from "../floor/table-status-projection.js";

// SPEC-012 — Tables API. Status is DERIVED (never persisted); until Floor
// (SPEC-057+) and Reservations (SPEC-095+) exist, no visit/reservation state
// is available, so every table currently resolves to AVAILABLE or BLOCKED
// (BLOCKED/CLEANING are the only inputs this route can source today).
const createTableBodySchema = z.object({
  salonId: z.string().uuid(),
  number: z.string().min(1).max(10),
  capacity: z.number().int().min(1).max(20),
  name: z.string().max(50).optional(),
});

const patchTableBodySchema = z.object({
  number: z.string().min(1).max(10).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  name: z.string().max(50).optional(),
});

function withDerivedStatus(table: Table) {
  const status = computeTableStatus({
    isBlocked: false,
    isCleaning: false,
    hasPayingVisit: false,
    hasOpenVisit: false,
    hasFutureReservation: false,
  });
  return { ...table, status };
}

export async function registerTableRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/tables", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "table:create");
      const body = createTableBodySchema.parse(req.body);

      const salon = await container.salons.findById(ctx.tenantId, body.salonId);
      if (!salon) return sendProblem(reply, correlationId, badRequest("Unknown salonId"));

      const table = await createTable(
        { salons: container.salons, tables: container.tables },
        {
          tenantId: ctx.tenantId,
          branchId: salon.branchId,
          ...omitUndefined(body),
          actorId: ctx.userId,
        },
      );
      reply.code(201);
      return { data: withDerivedStatus(table) };
    } catch (err) {
      if (err instanceof SalonNotOperableError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof DuplicateTableNumberError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof TableCapacityExceedsSalonError || err instanceof InvalidTableCapacityError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/tables", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "table:read");
      const query = req.query as Record<string, string | undefined>;
      const salonId = query["salonId"];
      const tables = salonId ? await container.tables.listBySalon(ctx.tenantId, salonId) : [];
      const result = paginate(tables.map(withDerivedStatus), parsePagination(req));
      return result;
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/tables/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "table:read");
      const table = await container.tables.findById(ctx.tenantId, req.params.id);
      if (!table) return sendProblem(reply, correlationId, notFound("Table"));
      return { data: withDerivedStatus(table) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/tables/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "table:write");
      const table = await container.tables.findById(ctx.tenantId, req.params.id);
      if (!table) return sendProblem(reply, correlationId, notFound("Table"));

      const body = omitUndefined(patchTableBodySchema.parse(req.body));
      const updated: Table = { ...table, ...body, updatedAt: new Date() };
      await container.tables.save(updated);
      return { data: withDerivedStatus(updated) };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  // SPEC-012 — GET /tables/:id/status is open to all authenticated users
  // (no permission check beyond tenant membership).
  app.get<{ Params: { id: string } }>("/v1/tables/:id/status", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const table = await container.tables.findById(ctx.tenantId, req.params.id);
      if (!table) return sendProblem(reply, correlationId, notFound("Table"));
      const projection = await projectTableStatus(
        container,
        ctx.tenantId,
        table,
      );
      return { data: projection };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}
