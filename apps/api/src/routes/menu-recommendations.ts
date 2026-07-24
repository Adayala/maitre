import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { recommendMenuItems, type RecommendationCandidate } from "@maitre/ordering";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";

// SPEC-092 — Menu Recommendations. Deterministic fallback ONLY (policyVersion
// "fallback-v1"); no ML ranking exists and the response declares the degraded
// mode (see menu-recommendations.ts in @maitre/ordering). Candidates are the
// AVAILABLE published products of the Menu, read here from Catalog.
const querySchema = z.object({
  categoryId: z.string().optional(),
  maxBudgetMinorUnits: z.coerce.number().int().nonnegative().optional(),
  sortBy: z.enum(["name", "price"]).optional(),
});

export async function registerMenuRecommendationRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get<{ Params: { menuId: string } }>("/v1/menus/:menuId/recommendations", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const query = querySchema.parse(req.query);
      const menu = await container.menus.findById(ctx.tenantId, req.params.menuId);
      if (!menu) return sendProblem(reply, correlationId, notFound("Menu"));

      const categories = await container.categories.listByMenu(ctx.tenantId, menu.id);
      const candidates: RecommendationCandidate[] = (
        await Promise.all(
          categories.map(async (c) => {
            const products = await container.products.listByCategory(ctx.tenantId, c.id);
            return products.map((p) => ({
              productId: p.id,
              name: p.name,
              priceMinorUnits: p.priceMinorUnits,
              categoryId: c.id,
              available: p.status === "AVAILABLE",
            }));
          }),
        )
      ).flat();

      const result = recommendMenuItems(candidates, {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.maxBudgetMinorUnits !== undefined ? { maxBudgetMinorUnits: query.maxBudgetMinorUnits } : {}),
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      });
      return { data: { menuRevisionId: menu.id, ...result } };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
