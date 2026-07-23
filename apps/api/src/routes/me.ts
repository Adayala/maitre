import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { ProblemDetails } from "@maitre/contracts";
import type { Container } from "../composition/container.js";
import {
  AuthenticationRequiredError,
  SessionExpiredError,
  IdentityNotEnabledError,
  resolveMeContext,
} from "../composition/resolve-me-context.js";

// SPEC-213 — GET /v1/me/context (no X-Tenant-Id/X-Branch-Id required).
export async function registerMeRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/me/context", async (req, reply) => {
    const correlationId =
      (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();

    try {
      const context = await resolveMeContext(
        container,
        req.headers.authorization,
        correlationId,
      );
      reply.header("x-correlation-id", correlationId);
      return context;
    } catch (err) {
      const problem = toProblemDetails(err, correlationId);
      reply.header("x-correlation-id", correlationId);
      if (problem.status === 401) {
        reply.header("www-authenticate", "Bearer");
      }
      reply.code(problem.status);
      return problem;
    }
  });
}

function toProblemDetails(err: unknown, correlationId: string): ProblemDetails {
  if (err instanceof AuthenticationRequiredError) {
    return {
      type: "authentication-required",
      title: "Authentication required",
      status: 401,
      correlationId,
    };
  }
  if (err instanceof SessionExpiredError) {
    return {
      type: "session-expired",
      title: "Session expired",
      status: 401,
      correlationId,
    };
  }
  if (err instanceof IdentityNotEnabledError) {
    return {
      type: "identity-not-enabled",
      title: "Identity not enabled",
      status: 403,
      correlationId,
    };
  }
  return {
    type: "internal-error",
    title: "Internal error",
    status: 500,
    correlationId,
  };
}
