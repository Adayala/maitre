import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createTenant, transitionTenant, type Tenant } from "@maitre/organization";
import { createMembership } from "@maitre/identity";
import type { Container } from "../composition/container.js";
import {
  requireAuthenticatedContext,
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import {
  sendProblem,
  notFound,
  badRequest,
  insufficientScope,
} from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-007 — Tenants API. POST provisions Tenant + an initial OWNER
// Membership as one workflow (SPEC-001 §7); it does not persist plan/trial
// fields (those belong to Subscription, SPEC-027, out of scope for I0).
// GET /tenants/:id/usage is deferred — it depends on Entitlement/Quota
// (SPEC-029/030), not yet implemented.
const createTenantBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  defaultLocale: z.string().min(2).default("es-AR"),
  defaultCurrency: z.string().length(3).default("ARS"),
  defaultTimezone: z.string().min(1).default("America/Argentina/Buenos_Aires"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

const patchTenantBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  contactPhone: z.string().optional(),
  defaultTimezone: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

function toResponse(tenant: Tenant) {
  return { data: tenant };
}

export async function registerTenantRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/tenants", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const auth = await requireAuthenticatedContext(container, req);
      const body = createTenantBodySchema.parse(req.body);

      const tenant = await createTenant(
        { tenants: container.tenants, outbox: container.outbox },
        { ...omitUndefined(body), actorId: auth.userId, correlationId },
      );
      await createMembership(
        { memberships: container.memberships },
        {
          tenantId: tenant.id,
          userId: auth.userId,
          roleIds: ["role_owner"],
          branchScopeType: "ALL_BRANCHES",
          actorId: auth.userId,
        },
      );

      reply.code(201);
      return toResponse(tenant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/tenants/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      if (ctx.tenantId !== req.params.id) {
        return sendProblem(reply, correlationId, insufficientScope());
      }
      requirePermission(ctx, "tenant:read");
      const tenant = await container.tenants.findById(req.params.id);
      if (!tenant) return sendProblem(reply, correlationId, notFound("Tenant"));
      return toResponse(tenant);
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/tenants/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      if (ctx.tenantId !== req.params.id) {
        return sendProblem(reply, correlationId, insufficientScope());
      }
      // SPEC-007 §Authorization — PATCH is OWNER only.
      requirePermission(ctx, "tenant:write");

      const tenant = await container.tenants.findById(req.params.id);
      if (!tenant) return sendProblem(reply, correlationId, notFound("Tenant"));

      const body = omitUndefined(patchTenantBodySchema.parse(req.body));
      let updated: Tenant = { ...tenant, ...body, updatedAt: new Date() };
      if (body.status && body.status !== tenant.status) {
        updated = { ...transitionTenant(tenant, body.status, new Date()), ...body };
      }

      await container.tenants.save(updated);
      return toResponse(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
