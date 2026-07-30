import type { FastifyReply } from "fastify";
import { ZodError } from "zod";
import type { ProblemDetails } from "@maitre/contracts";

const PROBLEM_TYPE_BASE = "https://docs.maitre.app/problems";

export interface ProblemFieldError {
  path: string;
  code: string;
  message: string;
}

// SPEC-023 §7 / SPEC-215 — shared Problem Details error contract.
export class HttpProblemError extends Error {
  constructor(
    public readonly status: number,
    public readonly slug: string,
    public readonly title: string,
    public readonly detail: string = title,
    public readonly code: string = toProblemCode(slug),
    public readonly errors?: ProblemFieldError[],
  ) {
    super(detail);
    this.name = "HttpProblemError";
  }
}

export const authenticationRequired = () =>
  new HttpProblemError(
    401,
    "authentication-required",
    "Authentication required",
  );
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
  new HttpProblemError(
    404,
    "not-found",
    "Resource not found",
    `${resource} not found`,
  );
export const conflict = (detail: string) =>
  new HttpProblemError(
    409,
    "conflict",
    "Request conflicts with current state",
    detail,
  );
export const badRequest = (detail: string | ZodError) => {
  if (detail instanceof ZodError) {
    return new HttpProblemError(
      400,
      "validation-failed",
      "Request validation failed",
      "One or more request fields are invalid.",
      "VALIDATION_FAILED",
      detail.issues.map((issue) => ({
        path: issue.path.join(".") || "$",
        code: issue.code.toUpperCase(),
        message: issue.message,
      })),
    );
  }
  return new HttpProblemError(400, "bad-request", "Bad request", detail);
};

export function sendProblem(
  reply: FastifyReply,
  correlationId: string,
  err: unknown,
): void {
  const problem = toProblemDetails(
    err,
    correlationId,
    new URL(reply.request.url, "http://maitre.local").pathname,
  );
  reply.header("x-correlation-id", correlationId);
  if (problem.status === 401) {
    reply.header("www-authenticate", "Bearer");
  }
  reply.type("application/problem+json").code(problem.status);
  reply.send(problem satisfies ProblemDetails);
}

export function toProblemDetails(
  err: unknown,
  correlationId: string,
  instance = "/",
): ProblemDetails {
  if (err instanceof ZodError) {
    return toProblemDetails(badRequest(err), correlationId, instance);
  }
  if (err instanceof HttpProblemError) {
    return {
      type: `${PROBLEM_TYPE_BASE}/${err.slug}`,
      title: err.title,
      status: err.status,
      detail: err.detail,
      instance,
      code: err.code,
      correlationId,
      ...(err.errors ? { errors: err.errors } : {}),
    };
  }
  return {
    type: `${PROBLEM_TYPE_BASE}/internal-error`,
    title: "Internal error",
    status: 500,
    detail: "The server could not complete the request.",
    instance,
    code: "INTERNAL_ERROR",
    correlationId,
  };
}

function toProblemCode(slug: string): string {
  return slug.replaceAll("-", "_").toUpperCase();
}
