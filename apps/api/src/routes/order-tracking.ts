import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  issueCapabilityToken,
  resolveCapabilityToken,
  CapabilityNotResolvableError,
  type Order,
} from "@maitre/ordering";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";

// SPEC-091 — Order Tracking. A public token variant and an internal
// permissioned variant return the same logical model with different redaction.
// This reads the current Order + item statuses live from the repository — no
// separate reconstructed projection/cursor/eventual-consistency model (deferred).
const issueBodySchema = z.object({
  ttlSeconds: z.number().int().positive().optional(),
});

function requireOrderBranchAccess(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
): void {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    throw notFound("Order");
  }
}

function trackingEnvelope(order: Order) {
  return {
    status: order.status,
    aggregateRevision: order.revision,
    projectionCursor: `${order.id}:${order.revision}`,
    asOf: new Date().toISOString(),
    lastConfirmedAt: order.updatedAt.toISOString(),
    freshness: {
      mode: "LIVE_SNAPSHOT",
      consistency: "EVENTUAL",
      degraded: false,
    },
  };
}

// Public/redacted view: item statuses only, no prices, names, notes or PII.
function publicTracking(order: Order) {
  return {
    ...trackingEnvelope(order),
    items: order.items.map((i) => ({
      id: i.id,
      status: i.status,
      confirmedAt: (i.cancelledAt ?? order.updatedAt).toISOString(),
      ...(i.cancelReason ? { reasonCode: i.cancelReason } : {}),
    })),
  };
}

// Internal view: adds names/quantities for operational staff (still no pricing
// redaction rules beyond what the aggregate carries).
function internalTracking(order: Order) {
  return {
    orderId: order.id,
    ...trackingEnvelope(order),
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      status: i.status,
      confirmedAt: (i.cancelledAt ?? order.updatedAt).toISOString(),
      ...(i.cancelReason ? { reasonCode: i.cancelReason } : {}),
    })),
  };
}

export async function registerOrderTrackingRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // POST /v1/orders/:id/tracking-token — authenticated issue.
  app.post<{ Params: { id: string } }>("/v1/orders/:id/tracking-token", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const body = issueBodySchema.parse(req.body ?? {});
      const order = await container.orders.findById(ctx.tenantId, req.params.id);
      if (!order) return sendProblem(reply, correlationId, notFound("Order"));
      requireOrderBranchAccess(ctx, order.branchId);
      const { token, record } = await issueCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        {
          tenantId: ctx.tenantId,
          purpose: "ORDER_TRACK_READ",
          resourceId: order.id,
          branchId: order.branchId,
          ...(body.ttlSeconds ? { ttlSeconds: body.ttlSeconds } : {}),
        },
      );
      reply.code(201);
      return { data: { token, id: record.id, expiresAt: record.expiresAt ?? null } };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  // GET /v1/orders/:id/tracking — internal, permissioned.
  app.get<{ Params: { id: string } }>("/v1/orders/:id/tracking", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const order = await container.orders.findById(ctx.tenantId, req.params.id);
      if (!order) return sendProblem(reply, correlationId, notFound("Order"));
      requireOrderBranchAccess(ctx, order.branchId);
      return { data: internalTracking(order) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // GET /public/tracking/:token — PUBLIC, redacted.
  app.get<{ Params: { token: string } }>("/public/tracking/:token", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const token = await resolveCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        req.params.token,
        "ORDER_TRACK_READ",
      );
      const order = await container.orders.findById(token.tenantId, token.resourceId);
      if (!order) return sendProblem(reply, correlationId, notFound("Order"));
      reply.header("cache-control", "private, max-age=5");
      return { data: publicTracking(order) };
    } catch (err) {
      if (err instanceof CapabilityNotResolvableError) return sendProblem(reply, correlationId, notFound("Order"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
