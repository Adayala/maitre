import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound } from "../http/problem-details.js";

// SPEC-032 — Entitlements API (read-only view of entitlements + quotas).
export async function registerEntitlementRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get<{ Params: { tenantId: string } }>(
    "/v1/entitlements/:tenantId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "entitle:read");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }

        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const entitlements = await container.entitlements.listBySubscription(subscription.id);
        const quotas = await container.quotas.listBySubscription(subscription.id);

        return {
          data: {
            entitlements: entitlements.map((e) => ({
              resource: e.resource,
              hardLimit: e.hardLimit,
              softLimit: e.softLimit ?? null,
            })),
            quotas: quotas.map((q) => ({ resource: q.resource, used: q.used })),
          },
        };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
