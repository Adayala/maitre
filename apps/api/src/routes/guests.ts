import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createGuest, updateGuest, anonymizeGuest } from "@maitre/reservations";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-072 — Guests API, simplified per approved scope: no merge/unmerge,
// no async export workflow, no per-field consent evidence ledger, no
// contact-points sub-resource. `anonymize` is synchronous (see
// domain/guest.ts scope note).
const createGuestBodySchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  locale: z.string().optional(),
  consentGiven: z.boolean().optional(),
  notes: z.string().optional(),
});

const updateGuestBodySchema = z.object({
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  locale: z.string().optional(),
  consentGiven: z.boolean().optional(),
  notes: z.string().optional(),
});

const lookupBodySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function registerGuestRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ guests: container.guests });

  app.post("/v1/guests", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "guest:pii_write");
      const body = createGuestBodySchema.parse(req.body);
      const guest = await createGuest(deps(), { tenantId: ctx.tenantId, ...omitUndefined(body) });
      reply.code(201);
      return { data: guest };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { guestId: string } }>("/v1/guests/:guestId", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "guest:pii_read");
      const guest = await container.guests.findById(ctx.tenantId, req.params.guestId);
      if (!guest) return sendProblem(reply, correlationId, notFound("Guest"));
      return { data: guest };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { guestId: string } }>("/v1/guests/:guestId", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "guest:pii_write");
      const body = updateGuestBodySchema.parse(req.body);
      const guest = await updateGuest(deps(), {
        tenantId: ctx.tenantId,
        guestId: req.params.guestId,
        ...omitUndefined(body),
      });
      return { data: guest };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("Guest"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/guests/lookup — exact contact lookup, requires guest:pii_read.
  app.post("/v1/guests/lookup", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "guest:pii_read");
      const body = lookupBodySchema.parse(req.body);
      if (!body.email && !body.phone) {
        return sendProblem(reply, correlationId, badRequest("email or phone is required"));
      }
      const guest = await container.guests.lookupByContact(ctx.tenantId, body.email, body.phone);
      return { data: guest };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/guests/:guestId/anonymizations — SPEC-072 simplified:
  // synchronous, not an async workflow (see guest-commands.ts).
  app.post<{ Params: { guestId: string } }>(
    "/v1/guests/:guestId/anonymizations",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "guest:anonymize");
        const guest = await anonymizeGuest(deps(), { tenantId: ctx.tenantId, guestId: req.params.guestId });
        return { data: guest };
      } catch (err) {
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("Guest"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
