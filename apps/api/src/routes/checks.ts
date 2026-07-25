import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createCheck,
  addCheckLine,
  addCheckAdjustment,
  requestPaymentCheck,
  voidCheck,
  settleCheck,
  computeCheckTotals,
  netCaptured,
  DuplicateCheckError,
  InvalidCheckTransitionError,
  CheckNotBalancedError,
} from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-058 — Checks API. Totals are always recalculated server-side from
// lines/adjustments/payments — client-supplied totals are never accepted.
const createCheckBodySchema = z.object({
  currency: z.string().length(3),
});

const addLineBodySchema = z.object({
  description: z.string().min(1),
  amountMinorUnits: z.number().int().nonnegative(),
});

const addAdjustmentBodySchema = z.object({
  description: z.string().min(1),
  amountMinorUnits: z.number().int(),
  reason: z.string().min(1),
});

const voidBodySchema = z.object({
  reason: z.string().min(1),
});

async function withTotals(container: Container, tenantId: string, check: Awaited<ReturnType<typeof createCheck>>) {
  const payments = await container.payments.listByCheck(tenantId, check.id);
  const paid = payments.reduce((sum, p) => sum + netCaptured(p), 0);
  const capturedCount = payments.filter((p) => p.status === "CAPTURED").length;
  const refundCount = payments.filter((p) => p.refund?.status === "SUCCEEDED").length;
  return {
    ...check,
    totals: computeCheckTotals(check, paid),
    paymentsSummary: {
      count: payments.length,
      capturedCount,
      refundCount,
      paidMinorUnits: paid,
    },
  };
}

export async function registerCheckRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ checks: container.checks, visits: container.visits, outbox: container.outbox });

  app.post<{ Params: { id: string } }>("/v1/visits/:id/check", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:read");
      const body = createCheckBodySchema.parse(req.body);
      const check = await createCheck(deps(), { tenantId: ctx.tenantId, visitId: req.params.id, currency: body.currency, correlationId });
      reply.code(201);
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof DuplicateCheckError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Visit"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/checks/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:read");
      const check = await container.checks.findById(ctx.tenantId, req.params.id);
      if (!check) return sendProblem(reply, correlationId, notFound("Check"));
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/visits/:id/check", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:read");
      const check = await container.checks.findByVisit(ctx.tenantId, req.params.id);
      if (!check) return sendProblem(reply, correlationId, notFound("Check"));
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/add-line", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:adjust");
      const body = addLineBodySchema.parse(req.body);
      const check = await addCheckLine({ checks: container.checks }, { tenantId: ctx.tenantId, checkId: req.params.id, ...body });
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      if (err instanceof Error) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/add-adjustment", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:adjust");
      const body = addAdjustmentBodySchema.parse(req.body);
      const check = await addCheckAdjustment({ checks: container.checks }, { tenantId: ctx.tenantId, checkId: req.params.id, ...body });
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      if (err instanceof Error) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/request-payment", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:adjust");
      const check = await requestPaymentCheck({ checks: container.checks }, { tenantId: ctx.tenantId, checkId: req.params.id });
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof InvalidCheckTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/void", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:void");
      const body = voidBodySchema.parse(req.body);
      const check = await voidCheck({ checks: container.checks }, { tenantId: ctx.tenantId, checkId: req.params.id, reason: body.reason });
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof InvalidCheckTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/settle", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:settle");
      const check = await settleCheck(
        { checks: container.checks, payments: container.payments, outbox: container.outbox },
        { tenantId: ctx.tenantId, checkId: req.params.id, correlationId },
      );
      return { data: await withTotals(container, ctx.tenantId, check) };
    } catch (err) {
      if (err instanceof CheckNotBalancedError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof InvalidCheckTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
