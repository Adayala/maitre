import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Container } from "../composition/container.js";
import { HttpProblemError, sendProblem } from "../http/problem-details.js";
import {
  AuthenticationRequiredError,
  SessionExpiredError,
  IdentityNotEnabledError,
  resolveMeContext,
} from "../composition/resolve-me-context.js";
import { correlationIdForRequest } from "../http/observability.js";

// SPEC-213 — GET /v1/me/context (no X-Tenant-Id/X-Branch-Id required).
export async function registerMeRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/me/context", async (req, reply) => {
    const correlationId = correlationIdForRequest(req) ?? randomUUID();

    try {
      const context = await resolveMeContext(
        container,
        req.headers.authorization,
        correlationId,
      );
      reply.header("x-correlation-id", correlationId);
      return context;
    } catch (err) {
      if (err instanceof AuthenticationRequiredError) {
        return sendProblem(
          reply,
          correlationId,
          new HttpProblemError(
            401,
            "authentication-required",
            "Authentication required",
          ),
        );
      }
      if (err instanceof SessionExpiredError) {
        return sendProblem(
          reply,
          correlationId,
          new HttpProblemError(401, "session-expired", "Session expired"),
        );
      }
      if (err instanceof IdentityNotEnabledError) {
        return sendProblem(
          reply,
          correlationId,
          new HttpProblemError(
            403,
            "identity-not-enabled",
            "Identity not enabled",
          ),
        );
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
