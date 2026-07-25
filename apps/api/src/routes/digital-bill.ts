import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  issueCapabilityToken,
  resolveCapabilityToken,
  CapabilityNotResolvableError,
} from "@maitre/ordering";
import { computeCheckTotals, netCaptured } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";

// SPEC-085/090 — Digital Bill. Issuing a BILL_READ capability is authenticated;
// resolving is PUBLIC and returns a live read-only projection of the underlying
// Floor Check (always the live Check — no cache/versioned-snapshot freeze; that
// mechanic is deferred). Guest, payment instruments and provider references are
// omitted. Invalid/expired/revoked -> generic 404.
const issueBodySchema = z.object({
  checkId: z.string().min(1),
  ttlSeconds: z.number().int().positive().optional(),
});

function requireCheckBranchAccess(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
): void {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    throw notFound("Check");
  }
}

export async function registerDigitalBillRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // POST /v1/bill-tokens — authenticated issue.
  app.post("/v1/bill-tokens", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "check:read");
      const body = issueBodySchema.parse(req.body);
      const check = await container.checks.findById(ctx.tenantId, body.checkId);
      if (!check) return sendProblem(reply, correlationId, notFound("Check"));
      requireCheckBranchAccess(ctx, check.branchId);
      const { token, record } = await issueCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        {
          tenantId: ctx.tenantId,
          purpose: "BILL_READ",
          resourceId: body.checkId,
          branchId: check.branchId,
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

  // GET /public/bills/:token — PUBLIC. Live projection of the Check.
  app.get<{ Params: { token: string } }>("/public/bills/:token", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const token = await resolveCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        req.params.token,
        "BILL_READ",
      );
      const check = await container.checks.findById(token.tenantId, token.resourceId);
      if (!check) return sendProblem(reply, correlationId, notFound("Bill"));
      const payments = await container.payments.listByCheck(token.tenantId, check.id);
      const paid = payments.reduce((sum, p) => sum + netCaptured(p), 0);
      const totals = computeCheckTotals(check, paid);
      reply.header("cache-control", "private, no-store");
      return {
        data: {
          checkRevision: check.revision,
          asOf: new Date().toISOString(),
          lastConfirmedAt: check.updatedAt.toISOString(),
          freshness: {
            mode: "LIVE_SNAPSHOT",
            consistency: "EVENTUAL",
            degraded: false,
          },
          currency: check.currency,
          status: check.status,
          lines: check.lines.map((l) => ({ description: l.description, amountMinorUnits: l.amountMinorUnits })),
          adjustments: check.adjustments.map((a) => ({
            description: a.description,
            amountMinorUnits: a.amountMinorUnits,
          })),
          paymentsSummary: {
            count: payments.length,
            paidMinorUnits: totals.paid,
            balanceMinorUnits: totals.balance,
          },
          totals,
        },
      };
    } catch (err) {
      if (err instanceof CapabilityNotResolvableError) return sendProblem(reply, correlationId, notFound("Bill"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
