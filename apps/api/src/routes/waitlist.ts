import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  addWaitlistEntry,
  notifyWaitlistEntry,
  seatWaitlistEntry,
  cancelWaitlistEntry,
  expireWaitlistEntry,
  setWaitlistPriorityOverride,
  sortWaitlistEntries,
  InvalidWaitlistTransitionError,
} from "@maitre/reservations";
import { openVisit } from "@maitre/floor";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-073 — Waitlist API, simplified FIFO + priorityOverride ordering
// (see domain/waitlist-entry.ts scope note). If-Match/idempotency-key
// header enforcement deferred, matching the same precedent as Floor.
const addBodySchema = z.object({
  guestId: z.string().optional(),
  partySize: z.number().int().positive(),
  quotedMinutes: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

const cancelBodySchema = z.object({ reason: z.string().min(1) });

const priorityOverrideBodySchema = z.object({
  priorityOverride: z.number().int(),
  reason: z.string().min(1),
});

export async function registerWaitlistRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ waitlistEntries: container.waitlistEntries });

  app.post<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/waitlist-entries",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:manage");
        const body = addBodySchema.parse(req.body);
        const entry = await addWaitlistEntry(deps(), {
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          ...omitUndefined(body),
        });
        reply.code(201);
        return { data: entry };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/waitlist-entries",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:read");
        const entries = await container.waitlistEntries.listByBranch(ctx.tenantId, req.params.branchId);
        return { data: sortWaitlistEntries(entries) };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { entryId: string } }>("/v1/waitlist-entries/:entryId", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "waitlist:read");
      const entry = await container.waitlistEntries.findById(ctx.tenantId, req.params.entryId);
      if (!entry) return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
      return { data: entry };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { entryId: string } }>(
    "/v1/waitlist-entries/:entryId/notify",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:manage");
        const entry = await notifyWaitlistEntry(deps(), {
          tenantId: ctx.tenantId,
          entryId: req.params.entryId,
        });
        return { data: entry };
      } catch (err) {
        if (err instanceof InvalidWaitlistTransitionError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  // POST /v1/waitlist-entries/:entryId/seat — opens a Visit via
  // @maitre/floor's openVisit and links it, same documented approach as
  // reservations.ts's /seat.
  app.post<{ Params: { entryId: string } }>("/v1/waitlist-entries/:entryId/seat", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "waitlist:manage");
      const entry = await container.waitlistEntries.findById(ctx.tenantId, req.params.entryId);
      if (!entry) return sendProblem(reply, correlationId, notFound("WaitlistEntry"));

      const body = z.object({ tableIds: z.array(z.string().min(1)).min(1) }).parse(req.body);
      const visit = await openVisit(
        { visits: container.visits, occupancies: container.occupancies, outbox: container.outbox },
        {
          tenantId: ctx.tenantId,
          branchId: entry.branchId,
          tableIds: body.tableIds,
          guestCount: entry.partySize,
          correlationId,
        },
      );

      const seated = await seatWaitlistEntry(deps(), {
        tenantId: ctx.tenantId,
        entryId: req.params.entryId,
        visitId: visit.id,
      });
      return { data: seated };
    } catch (err) {
      if (err instanceof InvalidWaitlistTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { entryId: string } }>(
    "/v1/waitlist-entries/:entryId/cancel",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:manage");
        const body = cancelBodySchema.parse(req.body);
        const entry = await cancelWaitlistEntry(deps(), {
          tenantId: ctx.tenantId,
          entryId: req.params.entryId,
          reason: body.reason,
        });
        return { data: entry };
      } catch (err) {
        if (err instanceof InvalidWaitlistTransitionError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { entryId: string } }>(
    "/v1/waitlist-entries/:entryId/expire",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:manage");
        const entry = await expireWaitlistEntry(deps(), {
          tenantId: ctx.tenantId,
          entryId: req.params.entryId,
        });
        return { data: entry };
      } catch (err) {
        if (err instanceof InvalidWaitlistTransitionError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  // POST /v1/waitlist-entries/:entryId/priority-overrides — part of the
  // SPEC-073 Waitlist surface, but guarded by the dedicated
  // waitlist:priority_override permission from SPEC-080 RBAC, distinct from
  // waitlist:manage.
  app.post<{ Params: { entryId: string } }>(
    "/v1/waitlist-entries/:entryId/priority-overrides",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "waitlist:priority_override");
        const body = priorityOverrideBodySchema.parse(req.body);
        const entry = await setWaitlistPriorityOverride(deps(), {
          tenantId: ctx.tenantId,
          entryId: req.params.entryId,
          priorityOverride: body.priorityOverride,
          reason: body.reason,
        });
        return { data: entry };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("WaitlistEntry"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
