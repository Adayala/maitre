import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createPayment,
  voidPayment,
  refundPayment,
  failPayment,
  PaymentExceedsBalanceError,
  InvalidPaymentTransitionError,
} from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";
import {
  capturePaymentWithCash,
  CashSessionMismatchError,
  CashSessionNotFoundError,
  CashSessionRequiredError,
} from "../floor/capture-payment-with-cash.js";

// SPEC-059 — Payments API. Idempotency-Key is mandatory for create-intent
// (create-intent/authorize/capture are collapsed per the simplified,
// synchronous-only Payment lifecycle — see payment-commands.ts). Never
// accepts/returns PAN/CVV.
const createPaymentBodySchema = z.object({
  amountMinorUnits: z.number().int().nonnegative(),
  currency: z.string().length(3),
  tipMinorUnits: z.number().int().nonnegative().optional(),
  method: z.enum(["CASH", "CARD", "OTHER"]),
  idempotencyKey: z.string().min(1),
});

const refundBodySchema = z.object({
  amountMinorUnits: z.number().int().nonnegative(),
});

const captureBodySchema = z.object({
  cashSessionId: z.string().uuid().optional(),
});

export async function registerPaymentRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ payments: container.payments, checks: container.checks, outbox: container.outbox });

  app.post<{ Params: { id: string } }>("/v1/checks/:id/payments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:create");
      const body = createPaymentBodySchema.parse(req.body);
      const payment = await createPayment(deps(), {
        tenantId: ctx.tenantId,
        branchId: req.headers["x-branch-id"] as string,
        checkId: req.params.id,
        ...omitUndefined(body),
      });
      reply.code(201);
      return { data: payment };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Check"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/checks/:id/payments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:create");
      const payments = await container.payments.listByCheck(ctx.tenantId, req.params.id);
      return { data: payments };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/payments/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:create");
      const payment = await container.payments.findById(ctx.tenantId, req.params.id);
      if (!payment) return sendProblem(reply, correlationId, notFound("Payment"));
      return { data: payment };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/payments/:id/capture", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:capture");
      const body = captureBodySchema.parse(req.body ?? {});
      const payment = await capturePaymentWithCash(container, {
        tenantId: ctx.tenantId,
        paymentId: req.params.id,
        actorId: ctx.userId,
        correlationId,
        ...omitUndefined(body),
      });
      return { data: payment };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof CashSessionRequiredError || err instanceof CashSessionMismatchError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof CashSessionNotFoundError) {
        return sendProblem(reply, correlationId, notFound("CashSession"));
      }
      if (err instanceof PaymentExceedsBalanceError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof InvalidPaymentTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Payment"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/payments/:id/fail", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:capture");
      const payment = await failPayment(deps(), { tenantId: ctx.tenantId, paymentId: req.params.id, correlationId });
      return { data: payment };
    } catch (err) {
      if (err instanceof InvalidPaymentTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Payment"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/payments/:id/void", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:refund");
      const payment = await voidPayment(deps(), { tenantId: ctx.tenantId, paymentId: req.params.id, correlationId });
      return { data: payment };
    } catch (err) {
      if (err instanceof InvalidPaymentTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Payment"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/payments/:id/refund", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "payment:refund");
      const body = refundBodySchema.parse(req.body);
      const payment = await refundPayment(deps(), { tenantId: ctx.tenantId, paymentId: req.params.id, amountMinorUnits: body.amountMinorUnits, correlationId });
      return { data: payment };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Payment"));
      if (err instanceof Error) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
