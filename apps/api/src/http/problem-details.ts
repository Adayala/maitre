import type { FastifyReply } from "fastify";
import type { ProblemDetails } from "@maitre/contracts";

// SPEC-023 §7 / SPEC-215 — shared Problem Details error contract.
export class HttpProblemError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: string,
    public readonly title: string,
  ) {
    super(title);
    this.name = "HttpProblemError";
  }
}

export const authenticationRequired = () =>
  new HttpProblemError(401, "authentication-required", "Authentication required");
export const sessionExpired = () =>
  new HttpProblemError(401, "session-expired", "Session expired");
export const identityNotEnabled = () =>
  new HttpProblemError(403, "identity-not-enabled", "Identity not enabled");
export const accessSuspended = () =>
  new HttpProblemError(403, "access-suspended", "Access suspended");
export const insufficientScope = () =>
  new HttpProblemError(403, "insufficient-scope", "Insufficient scope");
export const stepUpRequired = () =>
  new HttpProblemError(403, "step-up-required", "Step-up required");
export const notFound = (resource: string) =>
  new HttpProblemError(404, "not-found", `${resource} not found`);
export const conflict = (detail: string) =>
  new HttpProblemError(409, "conflict", detail);
export const badRequest = (detail: string) =>
  new HttpProblemError(400, "bad-request", detail);

export function sendProblem(
  reply: FastifyReply,
  correlationId: string,
  err: unknown,
): void {
  const problem = toProblemDetails(err, correlationId);
  reply.header("x-correlation-id", correlationId);
  if (problem.status === 401) {
    reply.header("www-authenticate", "Bearer");
  }
  reply.code(problem.status);
  reply.send(problem satisfies ProblemDetails);
}

function toProblemDetails(err: unknown, correlationId: string): ProblemDetails {
  if (err instanceof HttpProblemError) {
    return { type: err.type, title: err.title, status: err.status, correlationId };
  }
  return {
    type: "internal-error",
    title: "Internal error",
    status: 500,
    correlationId,
  };
}
