import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createSalon, BranchNotOperableError, type Salon } from "@maitre/organization";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-011 — Salons API
const createSalonBodySchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().trim().min(1).max(50),
  capacity: z.number().int().positive(),
  description: z.string().optional(),
});

const patchSalonBodySchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

function toResponse(salon: Salon) {
  return { data: salon };
}

export async function registerSalonRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/salons", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "salon:create");
      const body = createSalonBodySchema.parse(req.body);

      const salon = await createSalon(
        { branches: container.branches, salons: container.salons },
        { tenantId: ctx.tenantId, ...omitUndefined(body), actorId: ctx.userId },
      );
      reply.code(201);
      return toResponse(salon);
    } catch (err) {
      if (err instanceof BranchNotOperableError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/salons", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "salon:read");
      const query = req.query as Record<string, string | undefined>;
      const branchId = query["branchId"];
      const salons = branchId
        ? await container.salons.listByBranch(ctx.tenantId, branchId)
        : [];
      return paginate(salons, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/salons/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "salon:read");
      const salon = await container.salons.findById(ctx.tenantId, req.params.id);
      if (!salon) return sendProblem(reply, correlationId, notFound("Salon"));
      const tables = await container.tables.listBySalon(ctx.tenantId, salon.id);
      return { data: { ...salon, tables } };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/salons/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "salon:write");
      const salon = await container.salons.findById(ctx.tenantId, req.params.id);
      if (!salon) return sendProblem(reply, correlationId, notFound("Salon"));

      const body = omitUndefined(patchSalonBodySchema.parse(req.body));
      const updated: Salon = { ...salon, ...body, updatedAt: new Date() };
      await container.salons.save(updated);
      return toResponse(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.delete<{ Params: { id: string } }>("/v1/salons/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "salon:write");
      const salon = await container.salons.findById(ctx.tenantId, req.params.id);
      if (!salon) return sendProblem(reply, correlationId, notFound("Salon"));
      await container.salons.save({
        ...salon,
        status: "INACTIVE",
        updatedAt: new Date(),
        updatedBy: ctx.userId,
      });
      reply.code(204);
      return null;
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}
