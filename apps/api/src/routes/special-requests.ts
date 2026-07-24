import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createSpecialRequest,
  acceptSpecialRequest,
  rejectSpecialRequest,
  fulfillSpecialRequest,
  FreeTextTooLongError,
  InvalidSpecialRequestTransitionError,
} from "@maitre/ordering";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-093 — Special Requests. Typed request against Reservation/Visit/Order
// with PENDING -> ACCEPTED | REJECTED, ACCEPTED -> FULFILLED. Creating is not
// accepting. Free text is normalized/capped; per-field purpose/visibility/
// retention/consent tracking is deferred (see special-request.ts). Only actors
// with special_request.review may accept/reject/fulfill.
const createBodySchema = z.object({
  requestType: z.string().min(1),
  targetType: z.enum(["RESERVATION", "VISIT", "ORDER"]),
  targetId: z.string().min(1),
  freeText: z.string().optional(),
});

const reviewBodySchema = z.object({
  reasonCode: z.string().optional(),
});

export async function registerSpecialRequestRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const deps = () => ({ specialRequests: container.specialRequests });

  app.post("/v1/special-requests", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:create");
      const body = createBodySchema.parse(req.body);
      const request = await createSpecialRequest(deps(), {
        tenantId: ctx.tenantId,
        requestType: body.requestType,
        targetType: body.targetType,
        targetId: body.targetId,
        createdByActor: ctx.userId,
        ...(body.freeText ? { freeText: body.freeText } : {}),
      });
      reply.code(201);
      return { data: request };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof FreeTextTooLongError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/special-requests/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "order:read");
      const request = await container.specialRequests.findById(ctx.tenantId, req.params.id);
      if (!request) return sendProblem(reply, correlationId, notFound("SpecialRequest"));
      return { data: request };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  const reviewCommand = (
    path: string,
    run: (tenantId: string, id: string, actor: string, reasonCode?: string) => Promise<unknown>,
  ) => {
    app.post<{ Params: { id: string } }>(path, async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "special_request:review");
        const body = reviewBodySchema.parse(req.body ?? {});
        const request = await run(ctx.tenantId, req.params.id, ctx.userId, body.reasonCode);
        return { data: request };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof InvalidSpecialRequestTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
        if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("SpecialRequest"));
        return sendProblem(reply, correlationId, err);
      }
    });
  };

  reviewCommand("/v1/special-requests/:id/accept", (tenantId, id, actor, reasonCode) =>
    acceptSpecialRequest(deps(), { tenantId, id, actor, ...(reasonCode ? { reasonCode } : {}) }),
  );
  reviewCommand("/v1/special-requests/:id/reject", (tenantId, id, actor, reasonCode) =>
    rejectSpecialRequest(deps(), { tenantId, id, actor, ...(reasonCode ? { reasonCode } : {}) }),
  );
  reviewCommand("/v1/special-requests/:id/fulfill", (tenantId, id, actor) =>
    fulfillSpecialRequest(deps(), { tenantId, id, actor }),
  );
}
