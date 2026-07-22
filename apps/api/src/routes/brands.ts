import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createBrand,
  DuplicateBrandSlugError,
  transitionBrand,
  canModifyBrandConfig,
  InvalidBrandTransitionError,
  type Brand,
} from "@maitre/organization";
import { brandConfigSchema } from "@maitre/contracts";
import type { Container } from "../composition/container.js";
import {
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-008 — Brands API (POST/GET list/GET:id/PATCH/DELETE-archive)
const createBrandBodySchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  config: brandConfigSchema,
});

const patchBrandBodySchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

function toResponse(brand: Brand) {
  return { data: brand };
}

export async function registerBrandRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/brands", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:create");
      const body = createBrandBodySchema.parse(req.body);

      const brand = await createBrand(
        { tenants: container.tenants, brands: container.brands },
        {
          tenantId: ctx.tenantId,
          ...omitUndefined(body),
          config: omitUndefined(body.config),
          actorId: ctx.userId,
        },
      );
      reply.code(201);
      return toResponse(brand);
    } catch (err) {
      if (err instanceof DuplicateBrandSlugError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/brands", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:read");
      const brands = await container.brands.listByTenant(ctx.tenantId);
      return paginate(brands, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/brands/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:read");
      const brand = await container.brands.findById(ctx.tenantId, req.params.id);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));
      return toResponse(brand);
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/brands/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const brand = await container.brands.findById(ctx.tenantId, req.params.id);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));

      const body = omitUndefined(patchBrandBodySchema.parse(req.body));
      if (!canModifyBrandConfig(brand) && Object.keys(body).length > 0) {
        return sendProblem(
          reply,
          correlationId,
          conflict("Archived brands cannot be modified"),
        );
      }

      let updated: Brand = { ...brand, ...body, updatedAt: new Date() };
      if (body.status && body.status !== brand.status) {
        updated = transitionBrand(brand, body.status, new Date());
        updated = { ...updated, ...body };
      }

      await container.brands.save(updated);
      return toResponse(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof InvalidBrandTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.delete<{ Params: { id: string } }>("/v1/brands/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:archive");
      const brand = await container.brands.findById(ctx.tenantId, req.params.id);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));

      const archived = transitionBrand(brand, "ARCHIVED", new Date());
      await container.brands.save(archived);
      reply.code(204);
      return null;
    } catch (err) {
      if (err instanceof InvalidBrandTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
