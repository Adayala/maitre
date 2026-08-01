import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createPlaza,
  updatePlaza,
  InvalidPlazaError,
  PlazaTableConflictError,
} from "@maitre/floor";
import type { Container } from "../composition/container.js";
import {
  requirePermission,
  requireTenantContext,
} from "../http/request-context.js";
import {
  badRequest,
  conflict,
  notFound,
  sendProblem,
} from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

const createBodySchema = z.object({
  salonId: z.string().uuid(),
  servicePeriodId: z.string().uuid(),
  name: z.string().min(2).max(80),
  waiterEmploymentId: z.string().uuid().nullable().optional(),
  tableIds: z.array(z.string().uuid()).min(1),
});

const patchBodySchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    waiterEmploymentId: z.string().uuid().nullable().optional(),
    tableIds: z.array(z.string().uuid()).min(1).optional(),
  })
  .refine(
    (body) => Object.keys(body).length > 0,
    "At least one field is required",
  );

export async function registerPlazaRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const deps = () => ({
    plazas: container.plazas,
    servicePeriods: container.servicePeriods,
    salons: container.salons,
    tables: container.tables,
    ...(container.employments ? { employments: container.employments } : {}),
  });

  app.get("/v1/plazas", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "service-period:manage");
      const query = req.query as Record<string, string | undefined>;
      const salonId = query["salonId"];
      const servicePeriodId = query["servicePeriodId"];
      if (!salonId && !servicePeriodId) {
        return sendProblem(
          reply,
          correlationId,
          badRequest("salonId or servicePeriodId is required"),
        );
      }
      const plazas = salonId
        ? await container.plazas.listBySalon(ctx.tenantId, salonId)
        : await container.plazas.listByServicePeriod(
            ctx.tenantId,
            servicePeriodId!,
          );
      return { data: plazas };
    } catch (error) {
      return sendProblem(reply, correlationId, error);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/plazas/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "service-period:manage");
      const plaza = await container.plazas.findById(
        ctx.tenantId,
        req.params.id,
      );
      if (!plaza) return sendProblem(reply, correlationId, notFound("Plaza"));
      return { data: plaza };
    } catch (error) {
      return sendProblem(reply, correlationId, error);
    }
  });

  app.post("/v1/plazas", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "service-period:manage");
      const body = createBodySchema.parse(req.body);
      const salon = await container.salons.findById(ctx.tenantId, body.salonId);
      if (!salon)
        return sendProblem(reply, correlationId, badRequest("Unknown salonId"));
      const plaza = await createPlaza(deps(), {
        tenantId: ctx.tenantId,
        branchId: salon.branchId,
        ...omitUndefined(body),
      });
      reply.code(201);
      return { data: plaza };
    } catch (error) {
      return sendPlazaError(reply, correlationId, error);
    }
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/plazas/:id",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const current = await container.plazas.findById(
          ctx.tenantId,
          req.params.id,
        );
        if (!current)
          return sendProblem(reply, correlationId, notFound("Plaza"));
        const body = omitUndefined(patchBodySchema.parse(req.body));
        const plaza = await updatePlaza(deps(), current, {
          name: body.name ?? current.name,
          tableIds: body.tableIds ?? current.tableIds,
          ...(body.waiterEmploymentId !== undefined
            ? { waiterEmploymentId: body.waiterEmploymentId }
            : {}),
        });
        return { data: plaza };
      } catch (error) {
        return sendPlazaError(reply, correlationId, error);
      }
    },
  );
}

function sendPlazaError(
  reply: Parameters<typeof sendProblem>[0],
  correlationId: string,
  error: unknown,
) {
  if (error instanceof z.ZodError || error instanceof InvalidPlazaError) {
    return sendProblem(reply, correlationId, badRequest(error.message));
  }
  if (error instanceof PlazaTableConflictError) {
    return sendProblem(reply, correlationId, conflict(error.message));
  }
  return sendProblem(reply, correlationId, error);
}
