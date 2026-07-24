import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import {
  requestReservationConfirmation,
  sendReservationReminder,
  communicateReservationCancellation,
} from "@maitre/reservations";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound } from "../http/problem-details.js";

// SPEC-075 — Reservation Notifications API. Simplified per approved scope:
// each command just creates+persists a NotificationIntent and appends an
// outbox event; NO real provider/SMS/email send is integrated (see
// application/notification-commands.ts).
export async function registerReservationNotificationRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  const deps = () => ({ notificationIntents: container.notificationIntents, outbox: container.outbox });

  async function requireReservation(ctx: { tenantId: string }, reservationId: string) {
    return container.reservations.findById(ctx.tenantId, reservationId);
  }

  app.post<{ Params: { reservationId: string } }>(
    "/v1/reservations/:reservationId/notification-intents/request-confirmation",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:notification_send");
        const reservation = await requireReservation(ctx, req.params.reservationId);
        if (!reservation) return sendProblem(reply, correlationId, notFound("Reservation"));
        const intent = await requestReservationConfirmation(deps(), {
          tenantId: ctx.tenantId,
          reservationId: req.params.reservationId,
          correlationId,
        });
        reply.code(201);
        return { data: intent };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { reservationId: string } }>(
    "/v1/reservations/:reservationId/notification-intents/send-reminder",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:notification_send");
        const reservation = await requireReservation(ctx, req.params.reservationId);
        if (!reservation) return sendProblem(reply, correlationId, notFound("Reservation"));
        const intent = await sendReservationReminder(deps(), {
          tenantId: ctx.tenantId,
          reservationId: req.params.reservationId,
          correlationId,
        });
        reply.code(201);
        return { data: intent };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { reservationId: string } }>(
    "/v1/reservations/:reservationId/notification-intents/communicate-cancellation",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:notification_send");
        const reservation = await requireReservation(ctx, req.params.reservationId);
        if (!reservation) return sendProblem(reply, correlationId, notFound("Reservation"));
        const intent = await communicateReservationCancellation(deps(), {
          tenantId: ctx.tenantId,
          reservationId: req.params.reservationId,
          correlationId,
        });
        reply.code(201);
        return { data: intent };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { notificationIntentId: string } }>(
    "/v1/notification-intents/:notificationIntentId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "reservation:notification_send");
        const intent = await container.notificationIntents.findById(
          ctx.tenantId,
          req.params.notificationIntentId,
        );
        if (!intent) return sendProblem(reply, correlationId, notFound("NotificationIntent"));
        return { data: intent };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
