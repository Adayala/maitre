import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  addService,
  removeService,
  upgradePlan,
  SubscriptionNotOperableError,
  ServiceNotFoundError,
  SubscriptionNotFoundError,
  UnknownPlanError,
} from "@maitre/subscription";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-031 — Subscriptions API.
const upgradeBodySchema = z.object({
  planId: z.string().min(1), // "planId" per spec wire format; value is a plan code (no separate Plan entity, see plan-registry.ts)
  billingCycle: z.enum(["MONTHLY", "ANNUALLY"]).optional(),
});

const addServiceBodySchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

export async function registerSubscriptionRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get<{ Params: { tenantId: string } }>(
    "/v1/subscriptions/:tenantId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "subscription:read");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));
        return { data: subscription };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post("/v1/subscriptions/upgrade", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "plan:upgrade");
      const body = upgradeBodySchema.parse(req.body);

      const subscription = await container.subscriptions.findByTenantId(ctx.tenantId);
      if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

      const updated = await upgradePlan(
        {
          subscriptions: container.subscriptions,
          subscriptionItems: container.subscriptionItems,
          entitlements: container.entitlements,
        },
        {
          subscriptionId: subscription.id,
          planCode: body.planId,
          ...(body.billingCycle ? { billingCycle: body.billingCycle } : {}),
        },
      );
      return { data: updated };
    } catch (err) {
      if (err instanceof UnknownPlanError || err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof SubscriptionNotFoundError) {
        return sendProblem(reply, correlationId, notFound("Subscription"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>(
    "/v1/subscriptions/:id/services",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        const body = addServiceBodySchema.parse(req.body);

        const item = await addService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            outbox: container.outbox,
          },
          { subscriptionId: req.params.id, ...omitUndefined(body), correlationId },
        );
        reply.code(201);
        return { data: item };
      } catch (err) {
        if (err instanceof SubscriptionNotOperableError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.delete<{ Params: { id: string; serviceId: string } }>(
    "/v1/subscriptions/:id/services/:serviceId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");

        const item = await removeService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            outbox: container.outbox,
          },
          { subscriptionId: req.params.id, serviceId: req.params.serviceId, correlationId },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof ServiceNotFoundError) {
          return sendProblem(reply, correlationId, notFound("Service"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
