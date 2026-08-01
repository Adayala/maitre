import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import {
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import { insufficientScope, sendProblem } from "../http/problem-details.js";

// SPEC-045 — GET /v1/audit-logs. Read-only; no create/update/delete exposed.
// Covered Floor, Ordering, Kitchen and Cash mutations are appended by the
// mandatory policy registry. CSV export (SPEC-045 "GET /audit/export") is
// explicitly deferred to a future job/spec.
export async function registerAuditLogRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/audit-logs", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "audit:read");

      const query = req.query as Record<string, string | undefined>;
      const requestedBranchId = query["branch_id"];
      if (
        requestedBranchId &&
        ctx.branchScopeType !== "ALL_BRANCHES" &&
        !ctx.branchIds.includes(requestedBranchId)
      ) {
        throw insufficientScope();
      }
      const limitRaw = Number(query["limit"] ?? 100);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(1, limitRaw), 500)
        : 100;

      const page = await container.auditLogs.query({
        tenantId: ctx.tenantId,
        ...(query["actor_id"] ? { actorId: query["actor_id"] } : {}),
        ...(query["branch_id"] ? { branchId: query["branch_id"] } : {}),
        ...(query["action_code"] ? { actionCode: query["action_code"] } : {}),
        ...(query["outcome"]
          ? { outcome: query["outcome"] as "SUCCEEDED" | "DENIED" | "FAILED" }
          : {}),
        ...(query["resource_type"]
          ? { resourceType: query["resource_type"] }
          : {}),
        ...(query["resource_id"] ? { resourceId: query["resource_id"] } : {}),
        ...(query["correlation_id"]
          ? { correlationId: query["correlation_id"] }
          : {}),
        ...(query["from"] ? { from: new Date(query["from"]) } : {}),
        ...(query["to"] ? { to: new Date(query["to"]) } : {}),
        ...(query["cursor"] ? { cursor: query["cursor"] } : {}),
        limit,
      });

      return {
        data: page.items,
        meta: {
          limit,
          ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}),
        },
      };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}
