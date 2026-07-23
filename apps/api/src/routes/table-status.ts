import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { computeTableStatus } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";

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

        const visits = await container.visits.listByBranch(ctx.tenantId, req.params.branchId);
        const now = new Date();
        const checksByVisitId = new Map();
        for (const visit of visits) {
          const check = await container.checks.findByVisit(ctx.tenantId, visit.id);
          if (check) checksByVisitId.set(visit.id, check);
        }

        const tableIds = new Set<string>();
        for (const visit of visits) for (const tableId of visit.tableIds) tableIds.add(tableId);

        const statuses = [];
        for (const tableId of tableIds) {
          const occupancies = await container.occupancies.listByTable(ctx.tenantId, tableId);
          statuses.push(computeTableStatus({ tableId, occupancies, checksByVisitId, now }));
        }
        return { data: statuses };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
