import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  seatReservation,
  markNoShow,
  InvalidReservationTransitionError,
  CapacityUnavailableError,
} from "@maitre/reservations";
import { openVisit } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-071 — Reservations API. No PATCH: each transition is a command
// endpoint. If-Match/idempotency-key header enforcement is deferred
// (matches the precedent set by visits.ts/subscriptions.ts/menus.ts). The
// separate public/capability-token surface (SPEC-071 §Public) is NOT
// implemented — all endpoints require normal Membership auth (see
// SPEC-080 scope note).
const createReservationBodySchema = z.object({
  guestId: z.string().optional(),
  partySize: z.number().int().positive(),
  startAt: z.coerce.date(),
  durationMinutes: z.number().int().positive(),
  source: z.string().optional(),
  cancellationPolicyId: z.string().optional(),
  notes: z.string().optional(),
});

const cancelBodySchema = z.object({
  reasonCode: z.string().min(1),
});

const noShowBodySchema = z.object({
  reason: z.string().min(1),
});

// Gathers all Tables for a Branch (Salon -> Table) for capacity checks.
// See calculate-availability.ts scope note: no multi-table combination
// logic, single-table capacity only.
async function branchTables(container: Container, tenantId: string, branchId: string) {
  const salons = await container.salons.listByBranch(tenantId, branchId);
  const tables = (
    await Promise.all(salons.map((s) => container.tables.listBySalon(tenantId, s.id)))
  ).flat();
  return tables.map((t) => ({ id: t.id, capacity: t.capacity }));
}

export async function registerReservationRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ reservations: container.reservations, outbox: container.outbox });

  app.post<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/reservations",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:create");
        const body = createReservationBodySchema.parse(req.body);

        const reservation = await createReservation(deps(), {
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          correlationId,
          ...omitUndefined(body),
        });
        reply.code(201);
        return { data: reservation };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { branchId: string }; Querystring: { status?: string } }>(
    "/v1/branches/:branchId/reservations",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:read");
        const reservations = await container.reservations.listByBranch(
          ctx.tenantId,
          req.params.branchId,
          omitUndefined({ status: req.query.status }),
        );
        return { data: reservations };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/reservations/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:read");
      const reservation = await container.reservations.findById(ctx.tenantId, req.params.id);
      if (!reservation) return sendProblem(reply, correlationId, notFound("Reservation"));
      return { data: reservation };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/reservations/:id/confirm", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:confirm");
      const existing = await container.reservations.findById(ctx.tenantId, req.params.id);
      if (!existing) return sendProblem(reply, correlationId, notFound("Reservation"));
      const tables = await branchTables(container, ctx.tenantId, existing.branchId);
      const reservation = await confirmReservation(deps(), {
        tenantId: ctx.tenantId,
        reservationId: req.params.id,
        tables,
        correlationId,
      });
      return { data: reservation };
    } catch (err) {
      if (err instanceof CapacityUnavailableError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof InvalidReservationTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/reservations/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:cancel");
      const body = cancelBodySchema.parse(req.body);
      const reservation = await cancelReservation(deps(), {
        tenantId: ctx.tenantId,
        reservationId: req.params.id,
        reasonCode: body.reasonCode,
        correlationId,
      });
      return { data: reservation };
    } catch (err) {
      if (err instanceof InvalidReservationTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/reservations/:id/seat — opens (via @maitre/floor's openVisit)
  // and links exactly one Visit in the same request. Documented approach:
  // this module stays decoupled from Floor's write path by calling
  // openVisit directly here at the route layer rather than duplicating
  // Visit-open logic inside @maitre/reservations.
  app.post<{ Params: { id: string } }>("/v1/reservations/:id/seat", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:seat");
      const existing = await container.reservations.findById(ctx.tenantId, req.params.id);
      if (!existing) return sendProblem(reply, correlationId, notFound("Reservation"));
      if (existing.status !== "CONFIRMED") {
        return sendProblem(
          reply,
          correlationId,
          conflict(`Reservation ${existing.id} must be CONFIRMED to seat`),
        );
      }

      const visit = await openVisit(
        {
          visits: container.visits,
          occupancies: container.occupancies,
          outbox: container.outbox,
        },
        {
          tenantId: ctx.tenantId,
          branchId: existing.branchId,
          tableIds: existing.tableIds ?? [],
          guestCount: existing.partySize,
          reservationId: existing.id,
          correlationId,
        },
      );

      const reservation = await seatReservation(deps(), {
        tenantId: ctx.tenantId,
        reservationId: req.params.id,
        visitId: visit.id,
      });
      return { data: reservation };
    } catch (err) {
      if (err instanceof InvalidReservationTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/reservations/:id/no-show", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:no_show");
      const body = noShowBodySchema.parse(req.body);
      const reservation = await markNoShow(deps(), {
        tenantId: ctx.tenantId,
        reservationId: req.params.id,
        reason: body.reason,
      });
      return { data: reservation };
    } catch (err) {
      if (err instanceof InvalidReservationTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
