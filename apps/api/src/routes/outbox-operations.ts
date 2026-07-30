import type { FastifyInstance } from "fastify";
import type { Container } from "../composition/container.js";
import {
  requirePermission,
  requireTenantContext,
} from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";
import { correlationIdForRequest } from "../http/observability.js";

export async function registerOutboxOperationsRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/operations/outbox-health", async (request, reply) => {
    const correlationId = correlationIdForRequest(request) ?? request.id;
    try {
      const context = await requireTenantContext(container, request);
      requirePermission(context, "audit:read");
      const snapshot = await container.outbox.getOperationalSnapshot({
        tenantId: context.tenantId,
      });
      return {
        data: {
          ...snapshot,
          scope: "CURRENT_TENANT",
          observedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return sendProblem(reply, correlationId, error);
    }
  });
}
