import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";

type SetupItemStatus = "COMPLETE" | "INCOMPLETE" | "BLOCKED";

interface SetupItem {
  code: string;
  status: SetupItemStatus;
  count: number;
  required: number;
  actionLink?: string;
}

// SPEC-046 — GET /v1/dashboard/setup-status. Derived from authoritative
// configuration state (no mutable stored percentage, no "mark as done"
// clicks) — every call recomputes from the real repositories.
export async function registerDashboardRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/dashboard/setup-status", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "dashboard:read");

      const tenant = await container.tenants.findById(ctx.tenantId);
      const brands = await container.brands.listByTenant(ctx.tenantId);
      const branches = await container.branches.listByTenant(ctx.tenantId);
      const memberships = await container.memberships.listByTenant(ctx.tenantId);

      let menuCount = 0;
      let productCount = 0;
      for (const brand of brands) {
        const menus = await container.menus.listByBrand(ctx.tenantId, brand.id);
        menuCount += menus.length;
        for (const menu of menus) {
          const categories = await container.categories.listByMenu(ctx.tenantId, menu.id);
          for (const category of categories) {
            const products = await container.products.listByCategory(
              ctx.tenantId,
              category.id,
            );
            productCount += products.length;
          }
        }
      }

      const items: SetupItem[] = [
        {
          code: "tenant",
          status: tenant ? "COMPLETE" : "BLOCKED",
          count: tenant ? 1 : 0,
          required: 1,
        },
        {
          code: "brands",
          status: brands.length >= 1 ? "COMPLETE" : "INCOMPLETE",
          count: brands.length,
          required: 1,
          actionLink: "/v1/brands",
        },
        {
          code: "branches",
          status: branches.length >= 1 ? "COMPLETE" : "INCOMPLETE",
          count: branches.length,
          required: 1,
          actionLink: "/v1/branches",
        },
        {
          code: "users",
          status: memberships.length >= 1 ? "COMPLETE" : "INCOMPLETE",
          count: memberships.length,
          required: 1,
          actionLink: "/v1/users",
        },
        {
          code: "menus",
          status: menuCount >= 1 ? "COMPLETE" : "INCOMPLETE",
          count: menuCount,
          required: 1,
        },
        {
          code: "products",
          status: productCount >= 1 ? "COMPLETE" : "INCOMPLETE",
          count: productCount,
          required: 1,
        },
      ];

      const nextSteps = items
        .filter((i) => i.status !== "COMPLETE")
        .map((i) => `Configurar ${i.code}`);

      return {
        data: {
          setup: Object.fromEntries(
            items.map((i) => [
              i.code,
              {
                status: i.status,
                count: i.count,
                required: i.required,
                ...(i.actionLink ? { actionLink: i.actionLink } : {}),
              },
            ]),
          ),
          nextSteps,
        },
      };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // SPEC-047 — GET /v1/dashboard/overview. Operational metrics (visits,
  // occupied tables, active orders, pending payments) depend on Floor/
  // Ordering/Payments (Fase 2), which don't exist yet — reported as
  // UNAVAILABLE rather than fabricated zeros, per the spec's own contract
  // ("una dependencia fallida no fabrica cero").
  app.get("/v1/dashboard/overview", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "dashboard:read");

      const tenant = await container.tenants.findById(ctx.tenantId);
      const brands = await container.brands.listByTenant(ctx.tenantId);
      const branches = await container.branches.listByTenant(ctx.tenantId);
      const now = new Date().toISOString();

      return {
        data: {
          setup: {
            status: "AVAILABLE",
            asOf: now,
            tenantName: tenant?.name ?? null,
            brandCount: brands.length,
            branchCount: branches.length,
          },
          operations: {
            status: "UNAVAILABLE",
            asOf: now,
            reason: "Floor/Ordering/Payments domains not implemented yet (Fase 2)",
            openVisits: null,
            occupiedTables: null,
            activeOrders: null,
            pendingPayments: null,
          },
          lastUpdated: now,
        },
      };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}
