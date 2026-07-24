import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createOrder,
  addOrderItem,
  submitOrder,
  cancelOrder,
  cancelOrderItem,
  changeOrderItemQuantity,
  transitionOrderItem,
  startKitchenTicket,
  markKitchenTicketReady,
  completeKitchenTicket,
  cancelKitchenTicket,
  CurrencyMismatchError,
  EmptyOrderError,
  InvalidOrderStateError,
  InvalidOrderItemTransitionError,
  InvalidKitchenTicketTransitionError,
  type OrderItemStatus,
} from "@maitre/ordering";
import { addCheckLine } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-087/089 — Orders API. No PATCH: each transition is a command endpoint.
// If-Match/Idempotency-Key header enforcement is deferred (matches the
// precedent set by checks.ts/reservations.ts). The server calculates all
// money from Catalog-resolved snapshots and never trusts client totals.
const createOrderBodySchema = z.object({
  notes: z.string().optional(),
});

const modifierSchema = z.object({
  groupCode: z.string().min(1),
  optionId: z.string().min(1),
  label: z.string().min(1),
  quantity: z.number().int().positive(),
  priceDeltaMinorUnits: z.number().int(),
});

const addItemBodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  modifiers: z.array(modifierSchema).optional(),
  notes: z.string().optional(),
});

const submitBodySchema = z.object({
  catalogRevisionId: z.string().optional(),
});

const cancelBodySchema = z.object({
  reasonCode: z.string().min(1),
});

const changeQtyBodySchema = z.object({
  newQuantity: z.number().int().positive(),
  reasonCode: z.string().min(1),
});

const transitionBodySchema = z.object({
  to: z.enum(["IN_PREP", "READY", "DELIVERED"]),
});

function orderDeps(container: Container) {
  return { orders: container.orders, kitchenTickets: container.kitchenTickets, outbox: container.outbox };
}

export async function registerOrderRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // POST /v1/visits/:visitId/orders — creates DRAFT. The Visit is resolved here
  // (branchId + currency) so the module stays decoupled from Floor's Visit.
  app.post<{ Params: { visitId: string } }>("/v1/visits/:visitId/orders", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:create");
      const body = createOrderBodySchema.parse(req.body ?? {});
      const visit = await container.visits.findById(ctx.tenantId, req.params.visitId);
      if (!visit) return sendProblem(reply, correlationId, notFound("Visit"));
      const tenant = await container.tenants.findById(ctx.tenantId);
      const currency = tenant?.defaultCurrency ?? "ARS";

      const order = await createOrder(
        { orders: container.orders },
        {
          tenantId: ctx.tenantId,
          branchId: visit.branchId,
          visitId: visit.id,
          currency,
          ...omitUndefined(body),
        },
      );
      reply.code(201);
      return { data: order };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { visitId: string } }>("/v1/visits/:visitId/orders", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const orders = await container.orders.listByVisit(ctx.tenantId, req.params.visitId);
      return { data: orders };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/orders/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const order = await container.orders.findById(ctx.tenantId, req.params.id);
      if (!order) return sendProblem(reply, correlationId, notFound("Order"));
      return { data: order };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/orders/:id/items — DRAFT only. Resolves the Product snapshot from
  // Catalog (price/name/allergens) and freezes it onto the item; client-sent
  // prices are ignored entirely.
  app.post<{ Params: { id: string } }>("/v1/orders/:id/items", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:create");
      const body = addItemBodySchema.parse(req.body);
      const order = await container.orders.findById(ctx.tenantId, req.params.id);
      if (!order) return sendProblem(reply, correlationId, notFound("Order"));
      const product = await container.products.findById(ctx.tenantId, body.productId);
      if (!product) return sendProblem(reply, correlationId, notFound("Product"));
      if (product.status !== "AVAILABLE") {
        return sendProblem(reply, correlationId, conflict(`Product ${product.id} is not available`));
      }

      const updated = await addOrderItem(
        { orders: container.orders },
        {
          tenantId: ctx.tenantId,
          orderId: order.id,
          productId: product.id,
          name: product.name,
          quantity: body.quantity,
          unitPriceMinorUnits: product.priceMinorUnits,
          currency: product.currency,
          allergens: product.allergens,
          modifiers: (body.modifiers ?? []).map((m) => ({ id: randomUUID(), ...m })),
          ...omitUndefined({ notes: body.notes }),
        },
      );
      reply.code(201);
      return { data: updated };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof CurrencyMismatchError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof InvalidOrderStateError) return sendProblem(reply, correlationId, conflict(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/orders/:id/submit — DRAFT -> SUBMITTED (idempotent). Creates the
  // KitchenTicket + submitted event, then appends the grand total as a Floor
  // Check line if a Check exists for the Visit (direct sequential call, not a
  // saga — documented SPEC-089 simplification).
  app.post<{ Params: { id: string } }>("/v1/orders/:id/submit", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:submit");
      const body = submitBodySchema.parse(req.body ?? {});
      const existing = await container.orders.findById(ctx.tenantId, req.params.id);
      if (!existing) return sendProblem(reply, correlationId, notFound("Order"));
      const wasDraft = existing.status === "DRAFT";

      const { order, ticket } = await submitOrder(orderDeps(container), {
        tenantId: ctx.tenantId,
        orderId: req.params.id,
        correlationId,
        ...omitUndefined(body),
      });

      if (wasDraft) {
        const check = await container.checks.findByVisit(ctx.tenantId, order.visitId);
        if (check?.status === "OPEN") {
          await addCheckLine(
            { checks: container.checks },
            {
              tenantId: ctx.tenantId,
              checkId: check.id,
              description: `Order ${order.id}`,
              amountMinorUnits: order.grandTotalMinorUnits,
            },
          );
        }
      }
      return { data: { order, ticket } };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof EmptyOrderError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof InvalidOrderStateError) return sendProblem(reply, correlationId, conflict(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Order"));
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/orders/:id/cancel — cancels all still-cancellable items via
  // OrderAdjustments (SPEC-087: never deletes the order or rewrites items).
  app.post<{ Params: { id: string } }>("/v1/orders/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:cancel");
      const body = cancelBodySchema.parse(req.body);
      const order = await cancelOrder(orderDeps(container), {
        tenantId: ctx.tenantId,
        orderId: req.params.id,
        reasonCode: body.reasonCode,
        actorType: "STAFF",
        correlationId,
      });
      return { data: order };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Order"));
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/orders/:id/items/:itemId/cancel — cancels one item (SPEC-089
  // cancel-quantity, simplified to whole-item), recording an OrderAdjustment.
  app.post<{ Params: { id: string; itemId: string } }>(
    "/v1/orders/:id/items/:itemId/cancel",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const order = await container.orders.findById(ctx.tenantId, req.params.id);
        if (!order) return sendProblem(reply, correlationId, notFound("Order"));
        const item = order.items.find((i) => i.id === req.params.itemId);
        // Cancelling an already-prepared/ready item needs the elevated grant.
        const needsPrepared = item?.status === "READY" || item?.status === "IN_PREP";
        requirePermission(ctx, needsPrepared ? "order:cancel_prepared" : "order:cancel");
        const body = cancelBodySchema.parse(req.body);
        const updated = await cancelOrderItem(orderDeps(container), {
          tenantId: ctx.tenantId,
          orderId: req.params.id,
          orderItemId: req.params.itemId,
          reasonCode: body.reasonCode,
          actorType: "STAFF",
          correlationId,
        });
        return { data: updated };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidOrderStateError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("OrderItem"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  // POST /v1/orders/:id/items/:itemId/change-quantity — SPEC-089 change-quantity.
  app.post<{ Params: { id: string; itemId: string } }>(
    "/v1/orders/:id/items/:itemId/change-quantity",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "order:modify");
        const body = changeQtyBodySchema.parse(req.body);
        const updated = await changeOrderItemQuantity(
          { orders: container.orders },
          {
            tenantId: ctx.tenantId,
            orderId: req.params.id,
            orderItemId: req.params.itemId,
            newQuantity: body.newQuantity,
            reasonCode: body.reasonCode,
            actorType: "STAFF",
          },
        );
        return { data: updated };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidOrderStateError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("OrderItem"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  // POST /v1/orders/:id/items/:itemId/transition — granular per-item lifecycle
  // move (order.deliver covers DELIVERED handoffs).
  app.post<{ Params: { id: string; itemId: string } }>(
    "/v1/orders/:id/items/:itemId/transition",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const body = transitionBodySchema.parse(req.body);
        requirePermission(ctx, body.to === "DELIVERED" ? "order:deliver" : "kitchen:line_start");
        const updated = await transitionOrderItem(
          { orders: container.orders, outbox: container.outbox },
          {
            tenantId: ctx.tenantId,
            orderId: req.params.id,
            orderItemId: req.params.itemId,
            to: body.to as OrderItemStatus,
            correlationId,
          },
        );
        return { data: updated };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidOrderItemTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof InvalidOrderStateError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("OrderItem"));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  // KitchenTicket command endpoints (SPEC-086, BASIC placeholder to be
  // superseded by the real Kitchen domain SPEC-098..110). These drive both the
  // ticket and the underlying Order's item statuses.
  const kitchenDeps = () => ({
    kitchenTickets: container.kitchenTickets,
    orders: container.orders,
    outbox: container.outbox,
  });

  app.get<{ Params: { id: string } }>("/v1/kitchen-tickets/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const ticket = await container.kitchenTickets.findById(ctx.tenantId, req.params.id);
      if (!ticket) return sendProblem(reply, correlationId, notFound("KitchenTicket"));
      return { data: ticket };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  const kitchenCommand = (
    path: string,
    permission: string,
    run: (tenantId: string, ticketId: string, correlationId: string) => Promise<unknown>,
  ) => {
    app.post<{ Params: { id: string } }>(path, async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, permission);
        const ticket = await run(ctx.tenantId, req.params.id, correlationId);
        return { data: ticket };
      } catch (err) {
        if (err instanceof InvalidKitchenTicketTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("KitchenTicket"));
        return sendProblem(reply, correlationId, err);
      }
    });
  };

  kitchenCommand("/v1/kitchen-tickets/:id/start", "kitchen:line_start", (tenantId, ticketId, correlationId) =>
    startKitchenTicket(kitchenDeps(), { tenantId, ticketId, correlationId }),
  );
  kitchenCommand("/v1/kitchen-tickets/:id/mark-ready", "kitchen:line_ready", (tenantId, ticketId, correlationId) =>
    markKitchenTicketReady(kitchenDeps(), { tenantId, ticketId, correlationId }),
  );
  kitchenCommand("/v1/kitchen-tickets/:id/complete", "order:deliver", (tenantId, ticketId, correlationId) =>
    completeKitchenTicket(kitchenDeps(), { tenantId, ticketId, correlationId }),
  );
  kitchenCommand("/v1/kitchen-tickets/:id/cancel", "order:cancel_prepared", (tenantId, ticketId) =>
    cancelKitchenTicket(kitchenDeps(), { tenantId, ticketId }),
  );
}
