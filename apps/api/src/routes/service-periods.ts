import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createServicePeriod,
  createPlaza,
  InvalidPlazaError,
  openServicePeriod,
  beginCloseServicePeriod,
  closeServicePeriod,
  cancelPlannedServicePeriod,
  ConflictingServicePeriodError,
  InvalidServicePeriodTransitionError,
  ServicePeriodCloseBlockedError,
} from "@maitre/floor";
import type { Container } from "../composition/container.js";
import {
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import {
  sendProblem,
  notFound,
  conflict,
  badRequest,
} from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-060 — ServicePeriods API.
const createBodySchema = z.object({
  businessDate: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "OTHER"]),
  plannedOpen: z.coerce.date().optional(),
  plannedClose: z.coerce.date().optional(),
});

const closeBodySchema = z.object({
  force: z.boolean().optional(),
  reason: z.string().optional(),
});

const forceCloseBodySchema = z.object({
  reason: z.string().min(1),
});

export async function registerServicePeriodRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const deps = () => ({ servicePeriods: container.servicePeriods });

  app.post<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/service-periods",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const body = createBodySchema.parse(req.body);
        const previousPeriods = (
          await container.servicePeriods.listByBranch(
            ctx.tenantId,
            req.params.branchId,
          )
        )
          .filter((candidate) => candidate.businessDate < body.businessDate)
          .sort(
            (left, right) =>
              right.businessDate.localeCompare(left.businessDate) ||
              right.createdAt.getTime() - left.createdAt.getTime(),
          );
        const previous = previousPeriods[0];
        const fixedPlazas = previous
          ? (
              await container.plazas.listByServicePeriod(
                ctx.tenantId,
                previous.id,
              )
            ).filter((plaza) => plaza.mode === "FIXED")
          : [];
        await assertFixedPlazasCanCarryForward(
          container,
          ctx.tenantId,
          req.params.branchId,
          fixedPlazas,
        );
        const period = await createServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          ...omitUndefined(body),
        });
        for (const source of fixedPlazas) {
          await createPlaza(
            {
              plazas: container.plazas,
              servicePeriods: container.servicePeriods,
              salons: container.salons,
              tables: container.tables,
              ...(container.employments
                ? { employments: container.employments }
                : {}),
            },
            {
              tenantId: ctx.tenantId,
              branchId: req.params.branchId,
              salonId: source.salonId,
              servicePeriodId: period.id,
              name: source.name,
              mode: "FIXED",
              sourcePlazaId: source.id,
              tableIds: source.tableIds,
              waiterEmploymentId: null,
            },
          );
        }
        reply.code(201);
        return { data: period };
      } catch (err) {
        if (err instanceof z.ZodError || err instanceof InvalidPlazaError)
          return sendProblem(reply, correlationId, badRequest(err.message));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/service-periods",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const periods = await container.servicePeriods.listByBranch(
          ctx.tenantId,
          req.params.branchId,
        );
        return { data: periods };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>(
    "/v1/service-periods/:id",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const period = await container.servicePeriods.findById(
          ctx.tenantId,
          req.params.id,
        );
        if (!period)
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return { data: period };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/service-periods/:id/open",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const period = await openServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          servicePeriodId: req.params.id,
        });
        return { data: period };
      } catch (err) {
        if (err instanceof ConflictingServicePeriodError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof InvalidServicePeriodTransitionError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found"))
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/service-periods/:id/begin-close",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const period = await beginCloseServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          servicePeriodId: req.params.id,
        });
        return { data: period };
      } catch (err) {
        if (err instanceof InvalidServicePeriodTransitionError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found"))
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/service-periods/:id/close",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const body = closeBodySchema.parse(req.body ?? {});
        const period = await closeServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          servicePeriodId: req.params.id,
          ...omitUndefined(body),
        });
        return { data: period };
      } catch (err) {
        if (err instanceof ServicePeriodCloseBlockedError)
          return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidServicePeriodTransitionError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof z.ZodError)
          return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof Error && err.message.includes("not found"))
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/service-periods/:id/force-close",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const body = forceCloseBodySchema.parse(req.body ?? {});
        const period = await closeServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          servicePeriodId: req.params.id,
          force: true,
          reason: body.reason,
        });
        return { data: period };
      } catch (err) {
        if (err instanceof ServicePeriodCloseBlockedError)
          return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidServicePeriodTransitionError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof z.ZodError)
          return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof Error && err.message.includes("not found"))
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/service-periods/:id/cancel-planned",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service-period:manage");
        const period = await cancelPlannedServicePeriod(deps(), {
          tenantId: ctx.tenantId,
          servicePeriodId: req.params.id,
        });
        return { data: period };
      } catch (err) {
        if (err instanceof InvalidServicePeriodTransitionError)
          return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found"))
          return sendProblem(reply, correlationId, notFound("ServicePeriod"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}

async function assertFixedPlazasCanCarryForward(
  container: Container,
  tenantId: string,
  branchId: string,
  plazas: Array<{ salonId: string; tableIds: string[] }>,
) {
  for (const plaza of plazas) {
    const [salon, tables] = await Promise.all([
      container.salons.findById(tenantId, plaza.salonId),
      Promise.all(
        plaza.tableIds.map((tableId) =>
          container.tables.findById(tenantId, tableId),
        ),
      ),
    ]);
    if (
      !salon ||
      salon.status !== "ACTIVE" ||
      salon.branchId !== branchId ||
      tables.some(
        (table) =>
          !table ||
          table.branchId !== branchId ||
          table.salonId !== plaza.salonId,
      )
    ) {
      throw new InvalidPlazaError(
        "A fixed plaza cannot be replicated because its salon or tables changed",
      );
    }
  }
}
