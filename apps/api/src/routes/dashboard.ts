import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import {
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import { sendProblem } from "../http/problem-details.js";

type SetupItemStatus = "COMPLETE" | "INCOMPLETE" | "BLOCKED";

interface SetupItem {
  code: string;
  status: SetupItemStatus;
  count: number;
  required: number;
  actionLink?: string;
}

interface OperationsSnapshot {
  openVisits: number;
  occupiedTables: number;
  activeOrders: number;
  pendingPayments: number;
}

interface OperationsResponse {
  status: "AVAILABLE" | "UNAVAILABLE";
  asOf: string;
  reason?: string;
  openVisits: number | null;
  occupiedTables: number | null;
  activeOrders: number | null;
  pendingPayments: number | null;
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
      const memberships = await container.memberships.listByTenant(
        ctx.tenantId,
      );

      let menuCount = 0;
      let productCount = 0;
      for (const brand of brands) {
        const menus = await container.menus.listByBrand(ctx.tenantId, brand.id);
        menuCount += menus.length;
        for (const menu of menus) {
          const categories = await container.categories.listByMenu(
            ctx.tenantId,
            menu.id,
          );
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

  // SPEC-047 — GET /v1/dashboard/overview. Operational metrics are derived
  // from the authoritative Floor, Ordering and Payment repositories. Source
  // failures degrade only the operations section and never fabricate zeroes.
  app.get("/v1/dashboard/overview", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "dashboard:read");

      const tenant = await container.tenants.findById(ctx.tenantId);
      const brands = await container.brands.listByTenant(ctx.tenantId);
      const branches = await container.branches.listByTenant(ctx.tenantId);
      const visibleBranches =
        ctx.branchScopeType === "ALL_BRANCHES"
          ? branches
          : branches.filter((branch) => ctx.branchIds.includes(branch.id));
      const now = new Date().toISOString();
      let operations: OperationsResponse;
      try {
        operations = {
          status: "AVAILABLE",
          asOf: now,
          ...(await loadOperationsSnapshot(
            container,
            ctx.tenantId,
            visibleBranches.map(({ id }) => id),
          )),
        };
      } catch (error) {
        req.log.error(
          {
            eventCode: "DASHBOARD_OPERATIONS_SOURCE_FAILED",
            errorName: error instanceof Error ? error.name : "UnknownError",
          },
          "dashboard operations source failed",
        );
        operations = {
          status: "UNAVAILABLE",
          asOf: now,
          reason: "Operational sources unavailable",
          openVisits: null,
          occupiedTables: null,
          activeOrders: null,
          pendingPayments: null,
        };
      }

      return {
        data: {
          setup: {
            status: "AVAILABLE",
            asOf: now,
            tenantName: tenant?.name ?? null,
            brandCount: brands.length,
            branchCount: branches.length,
          },
          operations,
          lastUpdated: now,
        },
      };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}

async function loadOperationsSnapshot(
  container: Container,
  tenantId: string,
  branchIds: string[],
): Promise<OperationsSnapshot> {
  const visits = (
    await Promise.all(
      branchIds.map((branchId) =>
        container.visits.listByBranch(tenantId, branchId),
      ),
    )
  ).flat();
  const occupanciesByVisit = await Promise.all(
    visits.map((visit) =>
      container.occupancies.listByVisit(tenantId, visit.id),
    ),
  );
  const ordersByVisit = await Promise.all(
    visits.map((visit) => container.orders.listByVisit(tenantId, visit.id)),
  );
  const checks = (
    await Promise.all(
      branchIds.map((branchId) =>
        container.checks.listByBranch(tenantId, branchId),
      ),
    )
  ).flat();
  const paymentsByCheck = await Promise.all(
    checks.map((check) => container.payments.listByCheck(tenantId, check.id)),
  );

  return {
    openVisits: visits.filter(
      ({ status }) => status === "OPEN" || status === "CLOSING",
    ).length,
    occupiedTables: new Set(
      occupanciesByVisit
        .flat()
        .filter(({ status }) => status === "ACTIVE")
        .map(({ tableId }) => tableId),
    ).size,
    activeOrders: ordersByVisit
      .flat()
      .filter(({ status }) => status !== "DELIVERED" && status !== "CANCELLED")
      .length,
    pendingPayments: paymentsByCheck
      .flat()
      .filter(({ status }) => status === "PENDING" || status === "AUTHORIZED")
      .length,
  };
}
