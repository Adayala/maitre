import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  evaluateAndRaiseAlerts,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  InvalidAlertTransitionError,
} from "@maitre/kitchen";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-105 — Kitchen Alerts API. Creation is via the synchronous on-demand
// evaluator (no background scheduler); acknowledge/resolve/escalate mutate the
// activation. Resolved alerts are terminal (a later condition creates a new one).
const resolveBodySchema = z.object({ reasonCode: z.string().min(1) });

export async function registerKitchenAlertRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{ Params: { branchId: string } }>("/v1/branches/:branchId/kitchen/alerts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:queue_read");
      const alerts = await container.kitchenAlerts.listByBranch(ctx.tenantId, req.params.branchId);
      return { data: alerts };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // Synchronous check-on-read: scans the branch's Commands and raises alerts for
  // any currently breaching a threshold rule (dedup-guarded).
  app.post<{ Params: { branchId: string } }>("/v1/branches/:branchId/kitchen/alerts/evaluate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:alert_acknowledge");
      const raised = await evaluateAndRaiseAlerts(
        { alerts: container.kitchenAlerts, commands: container.commands },
        { tenantId: ctx.tenantId, branchId: req.params.branchId },
      );
      return { data: raised };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/alerts/:id/acknowledge", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:alert_acknowledge");
      const alert = await acknowledgeAlert({ alerts: container.kitchenAlerts }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: alert };
    } catch (err) {
      if (err instanceof InvalidAlertTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("KitchenAlert"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/alerts/:id/resolve", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:alert_resolve");
      const body = resolveBodySchema.parse(req.body);
      const alert = await resolveAlert(
        { alerts: container.kitchenAlerts },
        { tenantId: ctx.tenantId, id: req.params.id, reasonCode: body.reasonCode },
      );
      return { data: alert };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof InvalidAlertTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("KitchenAlert"));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/alerts/:id/escalate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:alert_escalate");
      const alert = await escalateAlert({ alerts: container.kitchenAlerts }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: alert };
    } catch (err) {
      if (err instanceof InvalidAlertTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("KitchenAlert"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
