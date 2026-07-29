import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";
import { listBranchTableStatuses } from "../floor/table-status-projection.js";

// SPEC-057 — GET-only Table Status projection. The branch and single-table
// routes share the same projector; no mutable status entity is persisted.
export async function registerTableStatusRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/table-statuses",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "table-status:read");

        const statuses = await listBranchTableStatuses(
          container,
          ctx.tenantId,
          req.params.branchId,
        );
        return { data: statuses };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
