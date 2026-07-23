import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createProduct,
  UnknownCategoryError,
  transitionProduct,
  InvalidProductTransitionError,
  InvalidPriceError,
  type Product,
} from "@maitre/catalog";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-042 — Products API.
const createProductBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
  priceMinorUnits: z.number().int().nonnegative(),
  currency: z.string().length(3),
  imageUrl: z.string().url().optional(),
  allergens: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
});

const patchProductBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().optional(),
  priceMinorUnits: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).optional(),
});

export async function registerProductRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post<{ Params: { categoryId: string } }>(
    "/v1/categories/:categoryId/products",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "product:create");
        const body = createProductBodySchema.parse(req.body);

        const product = await createProduct(
          { categories: container.categories, products: container.products },
          {
            tenantId: ctx.tenantId,
            categoryId: req.params.categoryId,
            ...omitUndefined(body),
            actorId: ctx.userId,
          },
        );
        reply.code(201);
        return { data: product };
      } catch (err) {
        if (err instanceof UnknownCategoryError || err instanceof InvalidPriceError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { categoryId: string } }>(
    "/v1/categories/:categoryId/products",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "product:read");
        const products = await container.products.listByCategory(
          ctx.tenantId,
          req.params.categoryId,
        );
        return { data: products };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.patch<{ Params: { id: string } }>("/v1/products/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "product:write");
      const product = await container.products.findById(ctx.tenantId, req.params.id);
      if (!product) return sendProblem(reply, correlationId, notFound("Product"));

      const body = omitUndefined(patchProductBodySchema.parse(req.body));
      let updated: Product = { ...product, ...body, updatedAt: new Date() };
      if (body.status && body.status !== product.status) {
        updated = { ...transitionProduct(product, body.status, new Date()), ...body };
      }
      await container.products.save(updated);
      return { data: updated };
    } catch (err) {
      if (err instanceof InvalidProductTransitionError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
