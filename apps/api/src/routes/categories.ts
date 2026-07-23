import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createCategory,
  UnknownMenuError,
  transitionCategory,
  InvalidCategoryTransitionError,
  type Category,
} from "@maitre/catalog";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-041 — Categories API.
const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
});

const patchCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export async function registerCategoryRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post<{ Params: { menuId: string } }>(
    "/v1/menus/:menuId/categories",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "category:create");
        const body = createCategoryBodySchema.parse(req.body);

        const category = await createCategory(
          { menus: container.menus, categories: container.categories },
          {
            tenantId: ctx.tenantId,
            menuId: req.params.menuId,
            ...omitUndefined(body),
            actorId: ctx.userId,
          },
        );
        reply.code(201);
        return { data: category };
      } catch (err) {
        if (err instanceof UnknownMenuError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { menuId: string } }>(
    "/v1/menus/:menuId/categories",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "category:read");
        const categories = await container.categories.listByMenu(
          ctx.tenantId,
          req.params.menuId,
        );
        return { data: categories };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.patch<{ Params: { id: string } }>("/v1/categories/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "category:write");
      const category = await container.categories.findById(ctx.tenantId, req.params.id);
      if (!category) return sendProblem(reply, correlationId, notFound("Category"));

      const body = omitUndefined(patchCategoryBodySchema.parse(req.body));
      let updated: Category = { ...category, ...body, updatedAt: new Date() };
      if (body.status && body.status !== category.status) {
        updated = { ...transitionCategory(category, body.status, new Date()), ...body };
      }
      await container.categories.save(updated);
      return { data: updated };
    } catch (err) {
      if (err instanceof InvalidCategoryTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
