import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createFiscalEntity,
  DuplicateCuitError,
  type FiscalEntity,
} from "@maitre/organization";
import { InvalidCuitError } from "@maitre/organization";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-009 — FiscalEntities API. All endpoints are OWNER only (fiscal:*
// is granted solely via role_owner's wildcard permission).
const createFiscalEntityBodySchema = z.object({
  name: z.string().trim().min(3).max(200),
  cuit: z.string().min(1),
  taxCondition: z.enum(["RI", "MONOTRIBUTISTA", "EXENTO"]),
});

const patchFiscalEntityBodySchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
});

function toResponse(entity: FiscalEntity) {
  return { data: entity };
}

export async function registerFiscalEntityRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/fiscal-entities", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:create");
      const body = createFiscalEntityBodySchema.parse(req.body);

      const entity = await createFiscalEntity(
        { tenants: container.tenants, fiscalEntities: container.fiscalEntities },
        { tenantId: ctx.tenantId, ...omitUndefined(body), actorId: ctx.userId },
      );
      reply.code(201);
      return toResponse(entity);
    } catch (err) {
      if (err instanceof DuplicateCuitError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof InvalidCuitError || err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(String(err.message)));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/fiscal-entities", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:read");
      const entities = await container.fiscalEntities.listByTenant(ctx.tenantId);
      return paginate(entities, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/fiscal-entities/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:read");
      const entity = await container.fiscalEntities.findById(ctx.tenantId, req.params.id);
      if (!entity) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      return toResponse(entity);
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/fiscal-entities/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:write");
      const entity = await container.fiscalEntities.findById(ctx.tenantId, req.params.id);
      if (!entity) return sendProblem(reply, correlationId, notFound("FiscalEntity"));

      const body = omitUndefined(patchFiscalEntityBodySchema.parse(req.body));
      const updated: FiscalEntity = { ...entity, ...body, updatedAt: new Date() };
      await container.fiscalEntities.save(updated);
      return toResponse(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
