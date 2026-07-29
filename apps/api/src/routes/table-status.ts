import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";
import { listBranchTableStatuses } from "../floor/table-status-projection.js";

// SPEC-057 — Table Status API. GET-only: a pure computed projection from
// Occupancy + Check data, not its own stored/repository-backed entity
// (see packages/modules/floor/src/domain/table-status.ts).
//
// NOTE: GET /v1/tables/:id/status already exists (SPEC-012, tables.ts) as
// a placeholder that only derives BLOCKED/AVAILABLE (no Occupancy data
// existed pre-Floor). Rather than register a duplicate route here — which
// Fastify rejects (FST_ERR_DUPLICATED_ROUTE) — this file only adds the
// branch-level listing; reconciling tables.ts's single-table placeholder
// with this module's richer OCCUPIED/PAYING projection is left as a
// follow-up (both are additive reads, not a behavior regression).
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
