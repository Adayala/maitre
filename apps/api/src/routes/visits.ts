import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  openVisit,
  moveVisitTables,
  requestCloseVisit,
  closeVisit,
  cancelVisit,
  reopenVisit,
  TableAlreadyOccupiedError,
  InvalidVisitTransitionError,
  VisitCloseBlockedError,
} from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-055 — Visits API. No PATCH: status/table changes go through
// command endpoints. If-Match/idempotency-key header enforcement is
// deferred (matches the precedent set by subscriptions.ts/menus.ts not
// implementing SPEC-217's full idempotency-key middleware either).
const createVisitBodySchema = z.object({
  branchId: z.string().min(1),
  tableIds: z.array(z.string().min(1)).min(1),
  guestCount: z.number().int().nonnegative(),
  reservationId: z.string().optional(),
});

const moveBodySchema = z.object({
  tableIds: z.array(z.string().min(1)).min(1),
});

const cancelBodySchema = z.object({
  reason: z.string().min(1),
});

const reopenBodySchema = z.object({
  reason: z.string().min(1),
});

export async function registerVisitRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({
    visits: container.visits,
    occupancies: container.occupancies,
    checks: container.checks,
    payments: container.payments,
    outbox: container.outbox,
  });

  app.post("/v1/visits", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:create");
      const body = createVisitBodySchema.parse(req.body);

      const visit = await openVisit(deps(), {
        tenantId: ctx.tenantId,
        correlationId,
        ...omitUndefined(body),
      });
      reply.code(201);
      return { data: visit };
    } catch (err) {
      if (err instanceof TableAlreadyOccupiedError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Querystring: { branchId?: string } }>("/v1/visits", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:create");
      if (!req.query.branchId) return sendProblem(reply, correlationId, badRequest("branchId is required"));
      const visits = await container.visits.listByBranch(ctx.tenantId, req.query.branchId);
      return { data: visits };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/visits/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:create");
      const visit = await container.visits.findById(ctx.tenantId, req.params.id);
      if (!visit) return sendProblem(reply, correlationId, notFound("Visit"));
      return { data: visit };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/visits/:id/move", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:move");
      const body = moveBodySchema.parse(req.body);
      const visit = await moveVisitTables(deps(), {
        tenantId: ctx.tenantId,
        visitId: req.params.id,
        tableIds: body.tableIds,
        correlationId,
      });
      return { data: visit };
    } catch (err) {
      if (err instanceof TableAlreadyOccupiedError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Visit"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/visits/:id/request-close", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:close");
      const visit = await requestCloseVisit(deps(), { tenantId: ctx.tenantId, visitId: req.params.id });
      return { data: visit };
    } catch (err) {
      if (err instanceof InvalidVisitTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Visit"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/visits/:id/close", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:close");
      const visit = await closeVisit(deps(), { tenantId: ctx.tenantId, visitId: req.params.id, correlationId });
      return { data: visit };
    } catch (err) {
      if (err instanceof InvalidVisitTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof VisitCloseBlockedError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Visit"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/visits/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:close");
      const body = cancelBodySchema.parse(req.body);
      const visit = await cancelVisit(deps(), { tenantId: ctx.tenantId, visitId: req.params.id, reason: body.reason });
      return { data: visit };
    } catch (err) {
      if (err instanceof InvalidVisitTransitionError || err instanceof VisitCloseBlockedError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Visit"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/visits/:id/reopen — SPEC-055/SPEC-065: manager-only corrective
  // workflow (visit:reopen is not granted to WAITER/MAITRE, only
  // ADMIN/MANAGER/OWNER — see role.ts).
  app.post<{ Params: { id: string } }>("/v1/visits/:id/reopen", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "visit:reopen");
      const body = reopenBodySchema.parse(req.body);
      const visit = await reopenVisit(deps(), { tenantId: ctx.tenantId, visitId: req.params.id, reason: body.reason });
      return { data: visit };
    } catch (err) {
      if (err instanceof InvalidVisitTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Visit"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
