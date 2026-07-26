import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  seatReservation,
  markNoShow,
  createReservationPreference,
  upsertCancellationPolicy,
  evaluateCancellation,
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

const createPreferenceBodySchema = z.object({
  subjectType: z.enum(["GUEST", "RESERVATION"]),
  subjectId: z.string().min(1),
  code: z.string().min(1),
  value: z.string().min(1).optional(),
  kind: z.enum(["PREFERENCE", "REQUIREMENT"]),
  notes: z.string().min(1).optional(),
});

const createCancellationPolicyBodySchema = z.object({
  name: z.string().min(1),
  hoursBeforeStartCutoff: z.number().int().nonnegative(),
  feeDescription: z.string().min(1).optional(),
});

const evaluateCancellationQuerySchema = z.object({
  startAt: z.coerce.date(),
  asOf: z.coerce.date().optional(),
});

const reservationListQuerySchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "EXPIRED", "SEATED", "CANCELLED", "NO_SHOW", "COMPLETED"])
    .optional(),
});

function toReservationListItemResponse(
  reservation: Awaited<ReturnType<Container["reservations"]["findById"]>> extends infer T ? Exclude<T, null> : never,
) {
  const { source: _source, ...rest } = reservation;
  return rest;
}

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
        const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
        if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));

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
        const query = reservationListQuerySchema.parse(req.query);
        const reservations = await container.reservations.listByBranch(
          ctx.tenantId,
          req.params.branchId,
          omitUndefined({ status: query.status }),
        );
        return { data: reservations.map(toReservationListItemResponse) };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
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

  app.post("/v1/reservation-preferences", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:create");
      const body = createPreferenceBodySchema.parse(req.body);
      const preference = await createReservationPreference(
        { preferences: container.reservationPreferences },
        {
          tenantId: ctx.tenantId,
          subjectType: body.subjectType,
          subjectId: body.subjectId,
          code: body.code,
          kind: body.kind,
          ...omitUndefined({ value: body.value, notes: body.notes }),
        },
      );
      reply.code(201);
      return { data: preference };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Querystring: { subjectType: "GUEST" | "RESERVATION"; subjectId: string } }>(
    "/v1/reservation-preferences",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:read");
        const query = z.object({
          subjectType: z.enum(["GUEST", "RESERVATION"]),
          subjectId: z.string().min(1),
        }).parse(req.query);
        const preferences = await container.reservationPreferences.listBySubject(
          ctx.tenantId,
          query.subjectType,
          query.subjectId,
        );
        return { data: preferences };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post("/v1/cancellation-policies", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:create");
      const body = createCancellationPolicyBodySchema.parse(req.body);
      const policy = await upsertCancellationPolicy(
        { cancellationPolicies: container.cancellationPolicies },
        { tenantId: ctx.tenantId, name: body.name, hoursBeforeStartCutoff: body.hoursBeforeStartCutoff, ...omitUndefined({ feeDescription: body.feeDescription }) },
      );
      return { data: policy };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/cancellation-policies/current", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:read");
      const policy = await container.cancellationPolicies.findByTenant(ctx.tenantId);
      if (!policy) return { data: null };
      return { data: policy };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Querystring: { startAt: string; asOf?: string } }>("/v1/cancellation-policies/evaluate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "reservation:read");
      const query = evaluateCancellationQuerySchema.parse(req.query);
      const policy = await container.cancellationPolicies.findByTenant(ctx.tenantId);
      const evaluation = evaluateCancellation(policy, query.startAt, query.asOf ?? new Date());
      return { data: evaluation };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
