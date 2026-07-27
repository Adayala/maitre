import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createReservation,
  cancelReservation,
  createGuest,
  InvalidReservationTransitionError,
} from "@maitre/reservations";
import type { Container } from "../composition/container.js";
import { requireTenantContext } from "../http/request-context.js";
import { sendProblem, badRequest, notFound, conflict } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

const createMyReservationBodySchema = z.object({
  branchId: z.string().min(1),
  partySize: z.number().int().positive(),
  startAt: z.coerce.date(),
  durationMinutes: z.number().int().positive(),
  notes: z.string().optional(),
});

const cancelMyReservationBodySchema = z.object({
  reasonCode: z.string().min(1),
});

function redactReservationSource<T extends { source?: string }>(reservation: T) {
  const { source: _source, ...rest } = reservation;
  return rest;
}

async function requireCurrentCustomerGuest(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
) {
  const user = await container.users.findById(ctx.userId);
  if (!user) {
    throw badRequest("Current user is not linked to a domain profile");
  }
  const customerEmail = user?.email ?? undefined;
  if (!customerEmail) {
    throw badRequest("Current user has no email for customer reservation ownership");
  }

  const guest = await container.guests.lookupByContact(ctx.tenantId, customerEmail, undefined);
  if (guest) return guest;

  return createGuest(
    { guests: container.guests },
    omitUndefined({
      tenantId: ctx.tenantId,
      displayName: user.displayName,
      email: user.email ?? undefined,
      consentGiven: false,
      notes: `Auto-linked from customer identity ${ctx.externalIdentityId}`,
    }),
  );
}

export async function registerCustomerReservationRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const deps = () => ({ reservations: container.reservations, outbox: container.outbox });

  app.post("/v1/my/reservations", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const body = createMyReservationBodySchema.parse(req.body);
      const branch = await container.branches.findById(ctx.tenantId, body.branchId);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));

      const guest = await requireCurrentCustomerGuest(container, ctx);
      const reservation = await createReservation(deps(), {
        tenantId: ctx.tenantId,
        branchId: body.branchId,
        guestId: guest.id,
        partySize: body.partySize,
        startAt: body.startAt,
        durationMinutes: body.durationMinutes,
        source: "CUSTOMER_APP",
        correlationId,
        ...omitUndefined({ notes: body.notes?.trim() || undefined }),
      });

      reply.code(201);
      return { data: redactReservationSource(reservation) };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/my/reservations", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const guest = await requireCurrentCustomerGuest(container, ctx);

      const reservations = await container.reservations.listByGuest(ctx.tenantId, guest.id);
      return { data: reservations.map(redactReservationSource) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/my/reservations/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const guest = await requireCurrentCustomerGuest(container, ctx);

      const reservation = await container.reservations.findById(ctx.tenantId, req.params.id);
      if (!reservation || reservation.guestId !== guest.id) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }
      return { data: redactReservationSource(reservation) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/my/reservations/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const guest = await requireCurrentCustomerGuest(container, ctx);
      const body = cancelMyReservationBodySchema.parse(req.body);

      const reservation = await container.reservations.findById(ctx.tenantId, req.params.id);
      if (!reservation || reservation.guestId !== guest.id) {
        return sendProblem(reply, correlationId, notFound("Reservation"));
      }

      const cancelled = await cancelReservation(deps(), {
        tenantId: ctx.tenantId,
        reservationId: req.params.id,
        reasonCode: body.reasonCode,
        correlationId,
      });
      return { data: redactReservationSource(cancelled) };
    } catch (err) {
      if (err instanceof InvalidReservationTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
