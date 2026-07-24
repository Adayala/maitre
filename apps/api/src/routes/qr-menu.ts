import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  issueCapabilityToken,
  resolveCapabilityToken,
  CapabilityNotResolvableError,
} from "@maitre/ordering";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";

// SPEC-084/088 — QR Menu. Issuing a MENU_READ capability is authenticated;
// resolving it is PUBLIC (no auth). Invalid/expired/revoked all return the same
// generic 404 (anti-enumeration). Rate limiting, ETag/cache and rotation are
// deferred (see capability-token.ts). The resolved payload is built here from
// the published Catalog (Menu -> Categories -> AVAILABLE Products) so the
// ordering module stays decoupled from Catalog.
const issueBodySchema = z.object({
  menuId: z.string().min(1),
  branchId: z.string().optional(),
  tableId: z.string().optional(),
  ttlSeconds: z.number().int().positive().optional(),
});

async function buildMenuPayload(container: Container, tenantId: string, menuId: string) {
  const menu = await container.menus.findById(tenantId, menuId);
  if (!menu) return null;
  const categories = await container.categories.listByMenu(tenantId, menuId);
  const categoryPayloads = await Promise.all(
    categories.map(async (category) => {
      const products = await container.products.listByCategory(tenantId, category.id);
      return {
        id: category.id,
        name: category.name,
        products: products
          .filter((p) => p.status === "AVAILABLE")
          .map((p) => ({
            id: p.id,
            name: p.name,
            priceMinorUnits: p.priceMinorUnits,
            currency: p.currency,
            allergens: p.allergens,
          })),
      };
    }),
  );
  return { menu: { id: menu.id, name: menu.name }, categories: categoryPayloads };
}

export async function registerQrMenuRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // POST /v1/qr-menu-tokens — authenticated issue.
  app.post("/v1/qr-menu-tokens", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const body = issueBodySchema.parse(req.body);
      const menu = await container.menus.findById(ctx.tenantId, body.menuId);
      if (!menu) return sendProblem(reply, correlationId, notFound("Menu"));
      const { token, record } = await issueCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        {
          tenantId: ctx.tenantId,
          purpose: "MENU_READ",
          resourceId: body.menuId,
          ...(body.branchId ? { branchId: body.branchId } : {}),
          ...(body.tableId ? { tableId: body.tableId } : {}),
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

  // GET /public/menu/:token — PUBLIC, unauthenticated.
  app.get<{ Params: { token: string } }>("/public/menu/:token", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const token = await resolveCapabilityToken(
        { capabilityTokens: container.capabilityTokens },
        req.params.token,
        "MENU_READ",
      );
      const payload = await buildMenuPayload(container, token.tenantId, token.resourceId);
      if (!payload) return sendProblem(reply, correlationId, notFound("Menu"));
      reply.header("cache-control", "private, max-age=30");
      return { data: payload };
    } catch (err) {
      // Anti-enumeration: any resolution failure is an indistinguishable 404.
      if (err instanceof CapabilityNotResolvableError) return sendProblem(reply, correlationId, notFound("Menu"));
      return sendProblem(reply, correlationId, err);
    }
  });
}
