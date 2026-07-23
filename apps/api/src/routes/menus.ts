import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createMenu,
  DuplicateMenuSlugError,
  transitionMenu,
  InvalidMenuTransitionError,
  type Menu,
} from "@maitre/catalog";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-040 — Menus API.
const createMenuBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const patchMenuBodySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export async function registerMenuRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post<{ Params: { brandId: string } }>(
    "/v1/brands/:brandId/menus",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "menu:create");
        const body = createMenuBodySchema.parse(req.body);

        const menu = await createMenu(
          { menus: container.menus },
          {
            tenantId: ctx.tenantId,
            brandId: req.params.brandId,
            ...omitUndefined(body),
            actorId: ctx.userId,
          },
        );
        reply.code(201);
        return { data: menu };
      } catch (err) {
        if (err instanceof DuplicateMenuSlugError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { brandId: string } }>(
    "/v1/brands/:brandId/menus",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "menu:read");
        const menus = await container.menus.listByBrand(ctx.tenantId, req.params.brandId);
        return { data: menus };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/menus/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "menu:read");
      const menu = await container.menus.findById(ctx.tenantId, req.params.id);
      if (!menu) return sendProblem(reply, correlationId, notFound("Menu"));
      const categories = await container.categories.listByMenu(ctx.tenantId, menu.id);
      return { data: { ...menu, categories } };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/menus/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "menu:write");
      const menu = await container.menus.findById(ctx.tenantId, req.params.id);
      if (!menu) return sendProblem(reply, correlationId, notFound("Menu"));

      const body = omitUndefined(patchMenuBodySchema.parse(req.body));
      let updated: Menu = { ...menu, ...body, updatedAt: new Date() };
      if (body.status && body.status !== menu.status) {
        updated = { ...transitionMenu(menu, body.status, new Date()), ...body };
      }
      await container.menus.save(updated);
      return { data: updated };
    } catch (err) {
      if (err instanceof InvalidMenuTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
