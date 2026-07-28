import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  addService,
  removeService,
  upgradePlan,
  addQuantityItem,
  updateQuantity,
  SubscriptionNotOperableError,
  ServiceNotFoundError,
  SubscriptionNotFoundError,
  UnknownPlanError,
  CatalogItemNotFoundError,
  MissingScopeRefError,
  InvalidQuantityForServiceError,
  SubscriptionItemNotFoundError,
} from "@maitre/subscription";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-031 — Subscriptions API.
const upgradeBodySchema = z.object({
  planId: z.string().min(1), // "planId" per spec wire format; value is a plan code (no separate Plan entity, see plan-registry.ts)
  billingCycle: z.enum(["MONTHLY", "ANNUALLY"]).optional(),
});

const addServiceBodySchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

const addItemBodySchema = z.object({
  catalogItemCode: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  scopeRefId: z.string().optional(),
});

const updateItemBodySchema = z.object({
  quantity: z.number().int().positive(),
});

export async function registerSubscriptionRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get<{ Params: { tenantId: string } }>(
    "/v1/subscriptions/:tenantId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "subscription:read");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));
        const items = await container.subscriptionItems.listBySubscription(subscription.id);
        return { data: { ...subscription, items } };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post("/v1/subscriptions/upgrade", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "plan:upgrade");
      const body = upgradeBodySchema.parse(req.body);

      const subscription = await container.subscriptions.findByTenantId(ctx.tenantId);
      if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

      const updated = await upgradePlan(
        {
          subscriptions: container.subscriptions,
          subscriptionItems: container.subscriptionItems,
          entitlements: container.entitlements,
          catalog: container.catalog,
        },
        {
          subscriptionId: subscription.id,
          planCode: body.planId,
          ...(body.billingCycle ? { billingCycle: body.billingCycle } : {}),
        },
      );
      return { data: updated };
    } catch (err) {
      if (err instanceof UnknownPlanError || err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof SubscriptionNotFoundError) {
        return sendProblem(reply, correlationId, notFound("Subscription"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>(
    "/v1/subscriptions/:id/services",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        const body = addServiceBodySchema.parse(req.body);
        const subscription = await container.subscriptions.findById(req.params.id);
        if (!subscription || subscription.tenantId !== ctx.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }

        const item = await addService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            catalog: container.catalog,
            outbox: container.outbox,
          },
          { subscriptionId: req.params.id, ...omitUndefined(body), correlationId },
        );
        reply.code(201);
        return { data: item };
      } catch (err) {
        if (err instanceof SubscriptionNotOperableError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.delete<{ Params: { id: string; serviceId: string } }>(
    "/v1/subscriptions/:id/services/:serviceId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        const subscription = await container.subscriptions.findById(req.params.id);
        if (!subscription || subscription.tenantId !== ctx.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }

        const item = await removeService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            catalog: container.catalog,
            outbox: container.outbox,
          },
          { subscriptionId: req.params.id, serviceId: req.params.serviceId, correlationId },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof ServiceNotFoundError) {
          return sendProblem(reply, correlationId, notFound("Service"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get("/v1/subscription-catalog", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      await requireTenantContext(container, req);
      const items = await container.catalog.listActive();
      return { data: items };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { tenantId: string } }>(
    "/v1/subscriptions/:tenantId/items",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const body = addItemBodySchema.parse(req.body);
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const catalogItem = await container.catalog.findByCode(body.catalogItemCode);
        if (!catalogItem || !catalogItem.isActive) {
          throw new CatalogItemNotFoundError(body.catalogItemCode);
        }
        if (catalogItem.billingScope !== "TENANT" && !body.scopeRefId) {
          throw new MissingScopeRefError(body.catalogItemCode);
        }
        if (catalogItem.billingType === "SERVICE" && body.quantity !== undefined) {
          return sendProblem(
            reply,
            correlationId,
            badRequest(`Catalog item "${body.catalogItemCode}" does not accept quantity`),
          );
        }

        const sharedDeps = {
          subscriptions: container.subscriptions,
          subscriptionItems: container.subscriptionItems,
          catalog: container.catalog,
          entitlements: container.entitlements,
          outbox: container.outbox,
        };
        const item =
          catalogItem.billingType === "QUANTITY"
            ? await addQuantityItem(sharedDeps, {
                subscriptionId: subscription.id,
                catalogItemCode: body.catalogItemCode,
                quantity: body.quantity ?? 1,
                ...(body.scopeRefId ? { scopeRefId: body.scopeRefId } : {}),
                correlationId,
              })
            : await addService(sharedDeps, {
                subscriptionId: subscription.id,
                serviceId: body.catalogItemCode,
                unitPrice: catalogItem.unitPrice,
                ...(body.scopeRefId ? { scopeRefId: body.scopeRefId } : {}),
                correlationId,
              });
        reply.code(201);
        return { data: item };
      } catch (err) {
        if (
          err instanceof CatalogItemNotFoundError ||
          err instanceof MissingScopeRefError ||
          err instanceof InvalidQuantityForServiceError ||
          err instanceof z.ZodError
        ) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.patch<{ Params: { tenantId: string; itemId: string } }>(
    "/v1/subscriptions/:tenantId/items/:itemId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const body = updateItemBodySchema.parse(req.body);
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const item = await updateQuantity(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            catalog: container.catalog,
          },
          { subscriptionId: subscription.id, itemId: req.params.itemId, quantity: body.quantity },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof SubscriptionItemNotFoundError) {
          return sendProblem(reply, correlationId, notFound("SubscriptionItem"));
        }
        if (err instanceof InvalidQuantityForServiceError || err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.delete<{ Params: { tenantId: string; itemId: string } }>(
    "/v1/subscriptions/:tenantId/items/:itemId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const items = await container.subscriptionItems.listBySubscription(subscription.id);
        const target = items.find((i) => i.id === req.params.itemId);
        if (!target) return sendProblem(reply, correlationId, notFound("SubscriptionItem"));

        const item = await removeService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            catalog: container.catalog,
            outbox: container.outbox,
          },
          {
            subscriptionId: subscription.id,
            serviceId: target.serviceId,
            scopeRefId: target.scopeRefId ?? null,
            correlationId,
          },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof ServiceNotFoundError) {
          return sendProblem(reply, correlationId, notFound("SubscriptionItem"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
